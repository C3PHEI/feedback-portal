using feedbackhub.Data;
using feedbackhub.Dtos;
using Microsoft.EntityFrameworkCore;

namespace feedbackhub.Services;

public class AdminModerationService
{
    private static readonly string[] AllowedStatuses = { "open", "resolved", "dismissed" };
    private static readonly string[] StatusTransitionAllowed = { "resolved", "dismissed" };
    private static readonly string[] AllowedActions =
        { "dismissed", "retained_with_note", "redacted", "removed" };

    private readonly AppDbContext _db;

    public AdminModerationService(AppDbContext db)
    {
        _db = db;
    }

    // ── Liste (Tab-Hauptansicht) ──────────────────────────────────────────────

    public async Task<IReadOnlyList<AdminReportListItemDto>> GetReportsAsync(
        string? status, string? search)
    {
        var query = _db.CocReports
            .Include(r => r.Reporter)
            .Include(r => r.Feedback).ThenInclude(f => f.Recipient)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && AllowedStatuses.Contains(status))
            query = query.Where(r => r.Status == status);

        // Suche: Report-ID (Prefix), Reporter-Name, Recipient-Name, Reason
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r =>
                r.Reporter.DisplayName.ToLower().Contains(s)
             || r.Feedback.Recipient.DisplayName.ToLower().Contains(s)
             || r.Reason.ToLower().Contains(s));
        }

        var results = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return results.Select(r => new AdminReportListItemDto(
            Id:                    r.Id,
            FeedbackId:            r.FeedbackId,
            ReporterDisplayName:   r.Reporter.DisplayName,
            RecipientDisplayName:  r.Feedback.Recipient.DisplayName,
            IsAnonymousFeedback:   r.Feedback.IsAnonymous,
            CreatedAt:             r.CreatedAt,
            Status:                r.Status,
            Reason:                r.Reason
        )).ToList();
    }

    // ── Stats (3 Kacheln) ─────────────────────────────────────────────────────

    public async Task<AdminReportStatsDto> GetStatsAsync()
    {
        var counts = await _db.CocReports
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        int Count(string s) => counts.FirstOrDefault(c => c.Status == s)?.Count ?? 0;

        return new AdminReportStatsDto(
            Open:      Count("open"),
            Resolved:  Count("resolved"),
            Dismissed: Count("dismissed")
        );
    }

    // ── Detail (inkl. kompletter Feedback-Inhalt) ───────────────────────────── .

    public async Task<AdminReportDetailDto?> GetByIdAsync(Guid reportId)
    {
        var report = await _db.CocReports
            .Include(r => r.Reporter)
            .Include(r => r.Feedback).ThenInclude(f => f.Submitter)
            .Include(r => r.Feedback).ThenInclude(f => f.Recipient)
            .Include(r => r.Feedback).ThenInclude(f => f.Ratings).ThenInclude(rt => rt.Driver)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null) return null;

        var f = report.Feedback;

        var feedbackDto = new AdminReportFeedbackDto(
            Id:                    f.Id,
            IsAnonymous:           f.IsAnonymous,
            IsEdited:              f.IsEdited,
            IsDeleted:             f.IsDeleted,
            // Im Moderations-Kontext darf der Admin den Submitter sehen —
            // sonst kann er Missbrauch (z.B. wiederholte anonyme Angriffe) nicht pruefen.
            Submitter:             new SubmitterInfo(f.Submitter.Id, f.Submitter.DisplayName),
            RecipientId:           f.RecipientId,
            RecipientDisplayName:  f.Recipient.DisplayName,
            SubmittedDate:         f.SubmittedDate,
            SubmittedAt:           f.SubmittedAt,
            Strengths:             f.Strengths,
            AreasToImprove:        f.AreasToImprove,
            Ratings:               f.Ratings
                .Select(r => new RatingResponse(r.DriverId, r.Driver.Name, r.Score, r.IsNa))
                .ToList()
        );

        return new AdminReportDetailDto(
            Id:                   report.Id,
            FeedbackId:           report.FeedbackId,
            Status:               report.Status,
            Reason:               report.Reason,
            CreatedAt:            report.CreatedAt,
            ResolvedAt:           report.ResolvedAt,
            ReporterId:           report.ReporterUserId,
            ReporterDisplayName:  report.Reporter.DisplayName,
            Feedback:             feedbackDto
        );
    }

    // ── Status setzen ─────────────────────────────────────────────────────────

    public async Task<ServiceResult> UpdateStatusAsync(Guid reportId, string newStatus)
    {
        // Nur Uebergaenge nach resolved/dismissed erlaubt — open ist nur Initial-State.
        if (!StatusTransitionAllowed.Contains(newStatus))
            return new ServiceResult(false, "invalid_status");

        var report = await _db.CocReports.FirstOrDefaultAsync(r => r.Id == reportId);
        if (report == null) return new ServiceResult(false, "report_not_found");

        report.Status = newStatus;
        report.ResolvedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }

    // ── Finale Entscheidung (Action) ──────────────────────────────────────────
    // IPA-Scope-Mapping der 3 Action-Typen aus [ADMIN]:
    //   dismissed          → status=dismissed
    //   retained_with_note → status=resolved  (keine DB-Aenderung am Feedback)
    //   removed            → status=resolved + feedback.is_deleted=true
    //                        → Feedback verschwindet aus Inbox/History/Averages
    public async Task<ServiceResult> ApplyActionAsync(Guid reportId, ReportActionRequest req)
    {
        if (!AllowedActions.Contains(req.Action))
            return new ServiceResult(false, "invalid_action");

        if (string.IsNullOrWhiteSpace(req.Reason))
            return new ServiceResult(false, "reason_required");

        var report = await _db.CocReports
            .Include(r => r.Feedback)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null) return new ServiceResult(false, "report_not_found");

        var now = DateTime.UtcNow;

        switch (req.Action)
        {
            case "dismissed":
                report.Status = "dismissed";
                break;

            case "retained_with_note":
            case "redacted":
                report.Status = "resolved";
                break;

            case "removed":
                report.Status = "resolved";
                report.Feedback.IsDeleted = true;
                break;
        }

        report.ResolvedAt = now;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }
}
