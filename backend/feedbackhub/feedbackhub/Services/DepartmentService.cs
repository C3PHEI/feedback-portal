using feedbackhub.Data;
using feedbackhub.Dtos;
using Microsoft.EntityFrameworkCore;

namespace feedbackhub.Services;

public class DepartmentService
{
  private readonly AppDbContext _db;
  private readonly CurrentUserService _currentUser;

  public DepartmentService(AppDbContext db, CurrentUserService currentUser)
  {
    _db = db;
    _currentUser = currentUser;
  }

  // -----------------------------------------------------------------
  // Alle Abteilungen (jeder eingeloggte User).
  // -----------------------------------------------------------------
  public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync()
  {
    return await _db.Departments
      .OrderBy(d => d.Name)
      .Select(d => new DepartmentDto(d.Id, d.Name))
      .ToListAsync();
  }

  // -----------------------------------------------------------------
  // Team-Liste fuer Manager — mit Aggregaten pro Mitglied.
  // -----------------------------------------------------------------
  public async Task<ServiceResult<IReadOnlyList<TeamMemberDto>>> GetMyTeamAsync()
  {
    var me = await _currentUser.GetAsync();
    if (me is null) return new(false, null, "Unauthorized");
    if (!me.IsDepartmentManager) return new(false, null, "Forbidden");
    if (me.DepartmentId is null) return new(false, null, "Forbidden");

    var departmentId = me.DepartmentId.Value;
    var myId = me.Id;

    // Schritt 1: Team-User
    var teamUsers = await _db.Users
      .Where(u => u.DepartmentId == departmentId
               && u.IsActive
               && u.Id != myId)
      .Select(u => new { u.Id, u.DisplayName, u.Role })
      .ToListAsync();

    if (teamUsers.Count == 0)
    {
      return new(true, Array.Empty<TeamMemberDto>());
    }

    var teamIds = teamUsers.Select(u => u.Id).ToList();

    // Schritt 2: Relevante Feedbacks
    var feedbacks = await _db.Feedbacks
      .Where(f => teamIds.Contains(f.RecipientId) && !f.IsDeleted)
      .Select(f => new { f.Id, f.RecipientId, f.IsAnonymous })
      .ToListAsync();

    var feedbackIds = feedbacks.Select(f => f.Id).ToList();

    // Schritt 3: Scores mit Recipient-Zuordnung via Join
    var scores = await _db.Ratings
      .Where(r => feedbackIds.Contains(r.FeedbackId) && !r.IsNa && r.Score != null)
      .Join(_db.Feedbacks,
            r => r.FeedbackId,
            f => f.Id,
            (r, f) => new { f.RecipientId, r.Score })
      .ToListAsync();

    // Schritt 4: In Memory aggregieren
    IReadOnlyList<TeamMemberDto> result = teamUsers.Select(u =>
    {
      var userFeedbacks = feedbacks.Where(f => f.RecipientId == u.Id).ToList();
      var userScores = scores.Where(s => s.RecipientId == u.Id)
                             .Select(s => s.Score!.Value)
                             .ToList();

      return new TeamMemberDto(
        Id:             u.Id,
        DisplayName:    u.DisplayName,
        Role:           u.Role,
        AvgRating:      userScores.Count == 0 ? null : Math.Round(userScores.Average(), 2),
        FeedbackCount:  userFeedbacks.Count,
        AnonymousCount: userFeedbacks.Count(f => f.IsAnonymous)
      );
    })
    .OrderBy(m => m.DisplayName)
    .ToList();

    return new(true, result);
  }

  // -----------------------------------------------------------------
  // Driver-Durchschnitte der gesamten Abteilung.
  // -----------------------------------------------------------------
  public async Task<ServiceResult<TeamAveragesDto>> GetMyTeamAveragesAsync()
  {
    var me = await _currentUser.GetAsync();
    if (me is null) return new(false, null, "Unauthorized");
    if (!me.IsDepartmentManager) return new(false, null, "Forbidden");
    if (me.DepartmentId is null) return new(false, null, "Forbidden");

    var departmentId = me.DepartmentId.Value;
    var myId = me.Id;

    var teamIds = await _db.Users
      .Where(u => u.DepartmentId == departmentId
               && u.IsActive
               && u.Id != myId)
      .Select(u => u.Id)
      .ToListAsync();

    // Driver immer laden — Response enthaelt alle 4, auch bei 0 Ratings
    var drivers = await _db.Drivers
      .OrderBy(d => d.Name)
      .Select(d => new { d.Id, d.Name })
      .ToListAsync();

    if (teamIds.Count == 0)
    {
      var empty = drivers.Select(d =>
        new TeamDriverAverageDto(d.Id, d.Name, null, 0, false)).ToList();
      return new(true, new TeamAveragesDto(0, 0, empty));
    }

    var feedbacks = await _db.Feedbacks
      .Where(f => teamIds.Contains(f.RecipientId) && !f.IsDeleted)
      .Select(f => new { f.Id, f.IsAnonymous })
      .ToListAsync();

    var totalReviews = feedbacks.Count;
    var anonymousCount = feedbacks.Count(f => f.IsAnonymous);
    var feedbackIds = feedbacks.Select(f => f.Id).ToList();

    var ratings = await _db.Ratings
      .Where(r => feedbackIds.Contains(r.FeedbackId) && !r.IsNa && r.Score != null)
      .Select(r => new { r.DriverId, r.Score })
      .ToListAsync();

    var driverAverages = drivers.Select(d =>
    {
      var scoreList = ratings.Where(r => r.DriverId == d.Id)
                             .Select(r => r.Score!.Value)
                             .ToList();

      return new TeamDriverAverageDto(
        DriverId:         d.Id,
        DriverName:       d.Name,
        Average:          scoreList.Count == 0 ? null : Math.Round(scoreList.Average(), 2),
        ReviewCount:      scoreList.Count,
        LowReviewWarning: scoreList.Count > 0 && scoreList.Count <= 2
      );
    }).ToList();

    return new(true, new TeamAveragesDto(totalReviews, anonymousCount, driverAverages));
  }

  // -----------------------------------------------------------------
  // Feedback-Historie eines einzelnen Team-Mitglieds.
  //
  // DSGVO (Features Punkt 3): Bei IsAnonymous=true werden Submitter UND
  // SubmittedAt null gesetzt. Nur SubmittedDate darf nach aussen.
  // -----------------------------------------------------------------
  public async Task<ServiceResult<IReadOnlyList<TeamMemberFeedbackDto>>> GetTeamMemberFeedbacksAsync(Guid userId)
  {
    var me = await _currentUser.GetAsync();
    if (me is null) return new(false, null, "Unauthorized");
    if (!me.IsDepartmentManager) return new(false, null, "Forbidden");
    if (me.DepartmentId is null) return new(false, null, "Forbidden");

    var target = await _db.Users
      .Where(u => u.Id == userId && u.IsActive)
      .Select(u => new { u.Id, u.DepartmentId })
      .FirstOrDefaultAsync();

    if (target is null) return new(false, null, "NotFound");
    if (target.DepartmentId != me.DepartmentId) return new(false, null, "Forbidden");
    if (target.Id == me.Id)
      return new(false, null, "Use /api/feedback/inbox for your own feedbacks.");

    var feedbacks = await _db.Feedbacks
      .Where(f => f.RecipientId == userId && !f.IsDeleted)
      .OrderByDescending(f => f.SubmittedAt)
      .Select(f => new
      {
        f.Id,
        f.SubmitterId,
        f.IsAnonymous,
        f.IsEdited,
        f.SubmittedDate,
        f.SubmittedAt,
        f.Strengths,
        f.AreasToImprove
      })
      .ToListAsync();

    if (feedbacks.Count == 0)
    {
      return new(true, Array.Empty<TeamMemberFeedbackDto>());
    }

    var feedbackIds = feedbacks.Select(f => f.Id).ToList();
    var submitterIds = feedbacks.Where(f => !f.IsAnonymous)
                                .Select(f => f.SubmitterId)
                                .Distinct()
                                .ToList();

    var submitterMap = submitterIds.Count == 0
      ? new Dictionary<Guid, string>()
      : await _db.Users
          .Where(u => submitterIds.Contains(u.Id))
          .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

    var ratings = await _db.Ratings
      .Where(r => feedbackIds.Contains(r.FeedbackId))
      .Join(_db.Drivers,
            r => r.DriverId,
            d => d.Id,
            (r, d) => new
            {
              r.FeedbackId,
              r.DriverId,
              DriverName = d.Name,
              r.Score,
              r.IsNa
            })
      .ToListAsync();

    var ratingsByFeedback = ratings
      .GroupBy(r => r.FeedbackId)
      .ToDictionary(g => g.Key, g => g.ToList());

    IReadOnlyList<TeamMemberFeedbackDto> result = feedbacks.Select(f =>
    {
      var fbRatings = ratingsByFeedback.TryGetValue(f.Id, out var list)
        ? list.Select(r => new FeedbackRatingDto(r.DriverId, r.DriverName, r.Score, r.IsNa))
              .ToList()
        : new List<FeedbackRatingDto>();

      return new TeamMemberFeedbackDto(
        Id:             f.Id,
        Submitter:      f.IsAnonymous
                          ? null
                          : new SubmitterDto(
                              f.SubmitterId,
                              submitterMap.TryGetValue(f.SubmitterId, out var name) ? name : ""),
        IsAnonymous:    f.IsAnonymous,
        SubmittedDate:  f.SubmittedDate,
        SubmittedAt:    f.IsAnonymous ? null : f.SubmittedAt,
        Strengths:      f.Strengths,
        AreasToImprove: f.AreasToImprove,
        IsEdited:       f.IsEdited,
        Ratings:        fbRatings
      );
    }).ToList();

    return new(true, result);
  }
}
