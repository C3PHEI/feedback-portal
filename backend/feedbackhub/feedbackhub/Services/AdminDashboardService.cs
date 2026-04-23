using feedbackhub.Data;
using feedbackhub.Dtos;
using Microsoft.EntityFrameworkCore;

namespace feedbackhub.Services;

/// <summary>
/// Liefert ausschliesslich aggregierte Daten fuer das Admin-Dashboard.
/// KEIN Zugriff auf einzelne Feedback-Inhalte — dafuer ist der CoC-Reports-Flow
/// mit Audit-Log zustaendig (siehe [ADMIN] "may not have freely or routinely
/// accessible dashboard with the overview of all the entries").
/// </summary>
public class AdminDashboardService
{
    private readonly AppDbContext _db;

    public AdminDashboardService(AppDbContext db)
    {
        _db = db;
    }

    // ── Stats (KPI-Kacheln) ───────────────────────────────────────────────────

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        // Nur nicht-geloeschte Feedbacks zaehlen (is_deleted=false)
        var feedbackAgg = await _db.Feedbacks
            .Where(f => !f.IsDeleted)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total     = g.Count(),
                Anonymous = g.Count(f => f.IsAnonymous),
                Edited    = g.Count(f => f.IsEdited)
            })
            .FirstOrDefaultAsync();

        var totalFeedbacks = feedbackAgg?.Total     ?? 0;
        var anonymousCount = feedbackAgg?.Anonymous ?? 0;
        var editedCount    = feedbackAgg?.Edited    ?? 0;

        var totalUsers = await _db.Users.CountAsync(u => u.IsActive);

        // Gesamtschnitt: alle Scores ueber alle nicht-geloeschten Feedbacks,
        // N/A-Ratings ausgenommen.
        var avgRating = await _db.Ratings
            .Where(r => !r.IsNa
                     && r.Score != null
                     && !r.Feedback.IsDeleted)
            .Select(r => (double)r.Score!.Value)
            .ToListAsync();

        double? avg = avgRating.Count > 0 ? Math.Round(avgRating.Average(), 2) : null;

        var anonymousRatePct = totalFeedbacks == 0
            ? 0
            : Math.Round((double)anonymousCount / totalFeedbacks * 100, 0);

        var editedRatePct = totalFeedbacks == 0
            ? 0
            : Math.Round((double)editedCount / totalFeedbacks * 100, 0);

        return new AdminStatsDto(
            TotalFeedbacks:    totalFeedbacks,
            TotalUsers:        totalUsers,
            AnonymousCount:    anonymousCount,
            AnonymousRatePct:  anonymousRatePct,
            AvgRating:         avg,
            EditedCount:       editedCount,
            EditedRatePct:     editedRatePct
        );
    }

    // ── Chart: Aktivitaet (public vs anonym, letzte 6 Monate) ─────────────────

    public async Task<AdminChartActivityDto> GetChartActivityAsync()
    {
        var now = DateTime.UtcNow;
        // Erster Tag des Monats, 5 Monate zurueck → ergibt 6 Buckets inkl. aktuellem Monat
        var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc)
                        .AddMonths(-5);

        var raw = await _db.Feedbacks
            .Where(f => !f.IsDeleted && f.SubmittedAt >= start)
            .Select(f => new { f.SubmittedAt, f.IsAnonymous })
            .ToListAsync();

        var labels    = new List<string>(6);
        var publics   = new List<int>(6);
        var anonymous = new List<int>(6);

        for (int i = 0; i < 6; i++)
        {
            var bucketStart = start.AddMonths(i);
            var bucketEnd   = bucketStart.AddMonths(1);

            labels.Add($"{bucketStart.Year:0000}-{bucketStart.Month:00}");
            publics.Add(raw.Count(f =>
                f.SubmittedAt >= bucketStart
             && f.SubmittedAt <  bucketEnd
             && !f.IsAnonymous));
            anonymous.Add(raw.Count(f =>
                f.SubmittedAt >= bucketStart
             && f.SubmittedAt <  bucketEnd
             && f.IsAnonymous));
        }

        return new AdminChartActivityDto(labels, publics, anonymous);
    }

    // ── Chart: Sichtbarkeit (Donut public vs. anonym) ─────────────────────────

    public async Task<AdminChartVisibilityDto> GetChartVisibilityAsync()
    {
        var agg = await _db.Feedbacks
            .Where(f => !f.IsDeleted)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Anonymous = g.Count(f => f.IsAnonymous),
                Public    = g.Count(f => !f.IsAnonymous)
            })
            .FirstOrDefaultAsync();

        return new AdminChartVisibilityDto(
            PublicCount:    agg?.Public    ?? 0,
            AnonymousCount: agg?.Anonymous ?? 0
        );
    }

    // ── Driver-Durchschnitte global ──────────────────────────────────────────

    public async Task<IReadOnlyList<AdminDriverAverageDto>> GetDriverAveragesAsync()
    {
        var drivers = await _db.Drivers
            .OrderBy(d => d.Name)
            .Select(d => new { d.Id, d.Name })
            .ToListAsync();

        var scores = await _db.Ratings
            .Where(r => !r.IsNa
                     && r.Score != null
                     && !r.Feedback.IsDeleted)
            .Select(r => new { r.DriverId, Score = r.Score!.Value })
            .ToListAsync();

        return drivers.Select(d =>
        {
            var list = scores.Where(s => s.DriverId == d.Id)
                             .Select(s => (double)s.Score)
                             .ToList();

            double? avg = list.Count > 0 ? Math.Round(list.Average(), 2) : null;
            double? pct = avg.HasValue  ? Math.Round(avg.Value / 5.0 * 100, 0) : null;

            return new AdminDriverAverageDto(
                DriverId:    d.Id,
                DriverName:  d.Name,
                Average:     avg,
                Pct:         pct,
                ReviewCount: list.Count
            );
        }).ToList();
    }

    // ── Feedback-Count pro Abteilung ─────────────────────────────────────────

    public async Task<IReadOnlyList<AdminDepartmentStatDto>> GetDepartmentStatsAsync()
    {
        // Count = Feedbacks, deren EMPFAENGER zur Abteilung gehoert.
        var raw = await _db.Departments
            .Select(d => new
            {
                d.Id,
                d.Name,
                Count = _db.Feedbacks.Count(f =>
                    !f.IsDeleted
                 && f.Recipient.DepartmentId == d.Id)
            })
            .ToListAsync();

        var maxCount = raw.Count > 0 ? raw.Max(x => x.Count) : 0;

        return raw
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Name)
            .Select(x => new AdminDepartmentStatDto(
                DepartmentId:   x.Id,
                DepartmentName: x.Name,
                FeedbackCount:  x.Count,
                Pct:            maxCount == 0 ? 0 : Math.Round((double)x.Count / maxCount * 100, 0)
            ))
            .ToList();
    }
}
