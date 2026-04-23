namespace feedbackhub.Dtos;

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
// KPIs-Kacheln oben im Dashboard. "Edited" = Anzahl Feedbacks mit is_edited=true.
public record AdminStatsDto(
  int TotalFeedbacks,
  int TotalUsers,
  int AnonymousCount,
  double AnonymousRatePct,   // 0–100, gerundet auf 0 Nachkommastellen
  double? AvgRating,         // Gesamtschnitt ueber alle Driver/Feedbacks, null wenn keine
  int EditedCount,
  double EditedRatePct       // EditedCount / TotalFeedbacks * 100
);

// ── GET /api/admin/charts/activity ────────────────────────────────────────────
// Zeitreihe der letzten 6 Monate (aktueller Monat + 5 rueckblickend).
// Labels im Format "YYYY-MM" — Frontend uebernimmt Lokalisierung.
public record AdminChartActivityDto(
  IReadOnlyList<string> Labels,
  IReadOnlyList<int> PublicCounts,
  IReadOnlyList<int> AnonymousCounts
);

// ── GET /api/admin/charts/visibility ──────────────────────────────────────────
// Donut: Verhaeltnis public vs. anonym (absolute Counts).
public record AdminChartVisibilityDto(
  int PublicCount,
  int AnonymousCount
);

// ── GET /api/admin/driver-averages ────────────────────────────────────────────
// Globaler Driver-Schnitt ueber ALLE nicht-geloeschten Feedbacks.
// Pct = Average / 5 * 100 (Skala 1–5), null wenn keine Ratings.
public record AdminDriverAverageDto(
  Guid DriverId,
  string DriverName,
  double? Average,
  double? Pct,
  int ReviewCount
);

// ── GET /api/admin/departments/stats ──────────────────────────────────────────
// Feedback-Count pro Abteilung. Pct = relativ zur groessten Abteilung (0–100).
public record AdminDepartmentStatDto(
  Guid DepartmentId,
  string DepartmentName,
  int FeedbackCount,
  double Pct
);
