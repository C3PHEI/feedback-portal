using feedbackhub.Data;
using feedbackhub.DTOs;
using feedbackhub.Models;
using Microsoft.EntityFrameworkCore;

namespace feedbackhub.Services;

public class FeedbackService
{
    private readonly AppDbContext _db;

    public FeedbackService(AppDbContext db)
    {
        _db = db;
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    public async Task<ServiceResult<Guid>> SubmitAsync(Guid submitterId, SubmitFeedbackRequest req)
    {
        // CoC-Bestätigung pflicht
        if (!req.CocConfirmed)
            return new ServiceResult<Guid>(false, default, "coc_not_confirmed");

        // Kein Selbst-Feedback
        if (submitterId == req.RecipientId)
            return new ServiceResult<Guid>(false, default, "self_feedback_not_allowed");

        // Empfänger muss existieren und aktiv sein
        var recipient = await _db.Users.FirstOrDefaultAsync(u => u.Id == req.RecipientId && u.IsActive);
        if (recipient == null)
            return new ServiceResult<Guid>(false, default, "recipient_not_found");

        // Mind. 2 Driver mit Score (nicht IsNa) [FEAT Feature 6]
        var scoredDrivers = req.Ratings.Count(r => !r.IsNa && r.Score.HasValue);
        if (scoredDrivers < 2)
            return new ServiceResult<Guid>(false, default, "min_two_drivers_required");

        // Mind. 1 Freitextfeld mit ≥200 Zeichen [FEAT Feature 8]
        var strengthsOk     = !string.IsNullOrEmpty(req.Strengths)      && req.Strengths.Length >= 200;
        var improvementsOk  = !string.IsNullOrEmpty(req.AreasToImprove) && req.AreasToImprove.Length >= 200;
        if (!strengthsOk && !improvementsOk)
            return new ServiceResult<Guid>(false, default, "text_too_short");

        // Anonym: Rate-Limit prüfen [FEAT Feature 9]
        if (req.IsAnonymous)
        {
            var currentYear  = DateTime.UtcNow.Year;
            var alreadyUsed  = await _db.AnonymousRateLimits.AnyAsync(a =>
                a.SubmitterId == submitterId &&
                a.RecipientId == req.RecipientId &&
                a.Year        == currentYear);

            if (alreadyUsed)
                return new ServiceResult<Guid>(false, default, "anonymous_rate_limit_exceeded");
        }

        var now = DateTime.UtcNow;

        var feedback = new Feedback
        {
            SubmitterId    = submitterId,
            RecipientId    = req.RecipientId,
            IsAnonymous    = req.IsAnonymous,
            Strengths      = req.Strengths,
            AreasToImprove = req.AreasToImprove,
            SubmittedDate  = DateOnly.FromDateTime(now),
            SubmittedAt    = now
        };

        _db.Feedbacks.Add(feedback);

        foreach (var r in req.Ratings)
        {
            _db.Ratings.Add(new Rating
            {
                FeedbackId = feedback.Id,
                DriverId   = r.DriverId,
                Score      = r.IsNa ? null : r.Score,
                IsNa       = r.IsNa
            });
        }

        // Anonym: Rate-Limit-Eintrag anlegen
        if (req.IsAnonymous)
        {
            _db.AnonymousRateLimits.Add(new AnonymousRateLimit
            {
                SubmitterId = submitterId,
                RecipientId = req.RecipientId,
                Year        = now.Year,
                CreatedAt   = now
            });
        }

        // Notification für den Empfänger anlegen
        _db.Notifications.Add(new Notification
        {
            FeedbackId      = feedback.Id,
            RecipientUserId = req.RecipientId,
            CreatedAt       = now
        });

        await _db.SaveChangesAsync();
        return new ServiceResult<Guid>(true, feedback.Id);
    }

    // ── Inbox ─────────────────────────────────────────────────────────────────

    public async Task<List<InboxFeedbackResponse>> GetInboxAsync(Guid recipientId)
    {
        var feedbacks = await _db.Feedbacks
            .Where(f => f.RecipientId == recipientId && !f.IsDeleted)
            .Include(f => f.Submitter)
            .Include(f => f.Ratings).ThenInclude(r => r.Driver)
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();

        return feedbacks.Select(f => new InboxFeedbackResponse(
            Id:             f.Id,
            IsAnonymous:    f.IsAnonymous,
            IsEdited:       f.IsEdited,
            Submitter:      f.IsAnonymous ? null : new SubmitterInfo(f.Submitter.Id, f.Submitter.DisplayName),
            SubmittedDate:  f.SubmittedDate,
            SubmittedAt:    f.IsAnonymous ? null : f.SubmittedAt,  // [FEAT Feature 3]
            Strengths:      f.Strengths,
            AreasToImprove: f.AreasToImprove,
            Ratings:        MapRatings(f.Ratings)
        )).ToList();
    }

    // ── Inbox Averages ────────────────────────────────────────────────────────

    public async Task<InboxAveragesResponse> GetInboxAveragesAsync(Guid recipientId)
    {
        var feedbacks = await _db.Feedbacks
            .Where(f => f.RecipientId == recipientId && !f.IsDeleted)
            .Include(f => f.Ratings).ThenInclude(r => r.Driver)
            .ToListAsync();

        var drivers = await _db.Drivers.ToListAsync();

        var driverAverages = drivers.Select(d =>
        {
            var scores = feedbacks
                .SelectMany(f => f.Ratings)
                .Where(r => r.DriverId == d.Id && !r.IsNa && r.Score.HasValue)
                .Select(r => (double)r.Score!.Value)
                .ToList();

            return new DriverAverageResponse(
                DriverId:   d.Id,
                DriverName: d.Name,
                Average:    scores.Count > 0 ? Math.Round(scores.Average(), 2) : null
            );
        }).ToList();

        return new InboxAveragesResponse(
            TotalReviews:   feedbacks.Count,
            AnonymousCount: feedbacks.Count(f => f.IsAnonymous),
            DriverAverages: driverAverages
        );
    }

    // ── History ───────────────────────────────────────────────────────────────

    public async Task<List<HistoryFeedbackResponse>> GetHistoryAsync(Guid submitterId)
    {
        var feedbacks = await _db.Feedbacks
            .Where(f => f.SubmitterId == submitterId && !f.IsDeleted)
            .Include(f => f.Recipient)
            .Include(f => f.Ratings).ThenInclude(r => r.Driver)
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;

        return feedbacks.Select(f => new HistoryFeedbackResponse(
            Id:             f.Id,
            RecipientId:    f.RecipientId,
            RecipientName:  f.Recipient.DisplayName,
            IsAnonymous:    f.IsAnonymous,
            IsEdited:       f.IsEdited,
            IsLocked:       (now - f.SubmittedAt).TotalMinutes > 5,  // [FEAT Feature 4]
            SubmittedDate:  f.SubmittedDate,
            SubmittedAt:    f.SubmittedAt,
            Strengths:      f.Strengths,
            AreasToImprove: f.AreasToImprove,
            Ratings:        MapRatings(f.Ratings)
        )).ToList();
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    public async Task<FeedbackDetailResponse?> GetByIdAsync(Guid feedbackId, Guid currentUserId)
    {
        var f = await _db.Feedbacks
            .Where(f => f.Id == feedbackId && !f.IsDeleted)
            .Include(f => f.Submitter)
            .Include(f => f.Recipient)
            .Include(f => f.Ratings).ThenInclude(r => r.Driver)
            .FirstOrDefaultAsync();

        if (f == null) return null;

        // Nur Sender oder Empfänger darf sehen [FEAT Feature 3]
        if (f.SubmitterId != currentUserId && f.RecipientId != currentUserId)
            return null;

        // Empfänger sieht bei anon. Feedback: kein Submitter, kein Timestamp
        var isRecipientView = f.RecipientId == currentUserId;
        var hideSubmitter   = f.IsAnonymous && isRecipientView;

        return new FeedbackDetailResponse(
            Id:             f.Id,
            IsAnonymous:    f.IsAnonymous,
            IsEdited:       f.IsEdited,
            Submitter:      hideSubmitter ? null : new SubmitterInfo(f.Submitter.Id, f.Submitter.DisplayName),
            RecipientId:    f.RecipientId,
            RecipientName:  f.Recipient.DisplayName,
            SubmittedDate:  f.SubmittedDate,
            SubmittedAt:    hideSubmitter ? null : f.SubmittedAt,
            Strengths:      f.Strengths,
            AreasToImprove: f.AreasToImprove,
            Ratings:        MapRatings(f.Ratings)
        );
    }

    // ── Update (5-Min-Editierfenster) ─────────────────────────────────────────

    public async Task<ServiceResult> UpdateAsync(Guid feedbackId, Guid currentUserId, UpdateFeedbackRequest req)
    {
        var f = await _db.Feedbacks
            .Include(f => f.Ratings)
            .FirstOrDefaultAsync(f => f.Id == feedbackId && !f.IsDeleted);

        if (f == null)
            return new ServiceResult(false, "not_found");

        if (f.SubmitterId != currentUserId)
            return new ServiceResult(false, "forbidden");

        // 5-Minuten-Fenster [FEAT Feature 4]
        if ((DateTime.UtcNow - f.SubmittedAt).TotalMinutes > 5)
            return new ServiceResult(false, "edit_window_expired");

        // Gleiche Validierung wie beim Submit
        var scoredDrivers = req.Ratings.Count(r => !r.IsNa && r.Score.HasValue);
        if (scoredDrivers < 2)
            return new ServiceResult(false, "min_two_drivers_required");

        var strengthsOk    = !string.IsNullOrEmpty(req.Strengths)      && req.Strengths.Length >= 200;
        var improvementsOk = !string.IsNullOrEmpty(req.AreasToImprove) && req.AreasToImprove.Length >= 200;
        if (!strengthsOk && !improvementsOk)
            return new ServiceResult(false, "text_too_short");

        // Alte Ratings ersetzen
        _db.Ratings.RemoveRange(f.Ratings);
        foreach (var r in req.Ratings)
        {
            _db.Ratings.Add(new Rating
            {
                FeedbackId = f.Id,
                DriverId   = r.DriverId,
                Score      = r.IsNa ? null : r.Score,
                IsNa       = r.IsNa
            });
        }

        f.Strengths      = req.Strengths;
        f.AreasToImprove = req.AreasToImprove;
        f.IsEdited       = true;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }

    // ── Report (Code of Conduct) ──────────────────────────────────────────────

    public async Task<ServiceResult> ReportAsync(Guid feedbackId, Guid reporterId, ReportFeedbackRequest req)
    {
        var f = await _db.Feedbacks.FirstOrDefaultAsync(f => f.Id == feedbackId && !f.IsDeleted);
        if (f == null)
            return new ServiceResult(false, "not_found");

        // Nur der Empfänger darf ein Feedback melden
        if (f.RecipientId != reporterId)
            return new ServiceResult(false, "forbidden");

        // Doppelter Report vom selben User verhindern
        var alreadyReported = await _db.CocReports.AnyAsync(r =>
            r.FeedbackId == feedbackId && r.ReporterUserId == reporterId);
        if (alreadyReported)
            return new ServiceResult(false, "already_reported");

        var now = DateTime.UtcNow;

        _db.CocReports.Add(new CocReport
        {
            FeedbackId     = feedbackId,
            ReporterUserId = reporterId,
            Reason         = req.Reason,
            CreatedAt      = now
        });

        // Notification für alle aktiven Admins anlegen [ADMIN]
        var admins = await _db.Users
            .Where(u => u.Role == "admin" && u.IsActive)
            .ToListAsync();

        foreach (var admin in admins)
        {
            _db.Notifications.Add(new Notification
            {
                FeedbackId      = feedbackId,
                RecipientUserId = admin.Id,
                CreatedAt       = now
            });
        }

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }

    // ── Can Submit Anonymous ──────────────────────────────────────────────────

    public async Task<CanSubmitAnonymousResponse> CanSubmitAnonymousAsync(Guid submitterId, Guid recipientId)
    {
        var currentYear = DateTime.UtcNow.Year;

        var exists = await _db.AnonymousRateLimits.AnyAsync(a =>
            a.SubmitterId == submitterId &&
            a.RecipientId == recipientId &&
            a.Year        == currentYear);

        if (!exists)
            return new CanSubmitAnonymousResponse(true, null);

        // Nächster möglicher Zeitpunkt: 1. Januar des Folgejahres
        var nextPossibleAt = new DateTime(currentYear + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        return new CanSubmitAnonymousResponse(false, nextPossibleAt);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private static List<RatingResponse> MapRatings(IEnumerable<Rating> ratings) =>
        ratings
            .Select(r => new RatingResponse(r.DriverId, r.Driver.Name, r.Score, r.IsNa))
            .ToList();
}
