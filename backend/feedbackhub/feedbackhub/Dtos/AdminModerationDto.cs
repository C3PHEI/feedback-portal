namespace feedbackhub.Dtos;

// ── GET /api/admin/reports ────────────────────────────────────────────────────
public record AdminReportListItemDto(
  Guid Id,
  Guid FeedbackId,
  string ReporterDisplayName,
  string RecipientDisplayName,
  bool IsAnonymousFeedback,
  DateTime CreatedAt,
  string Status,
  string Reason
);

// ── GET /api/admin/reports/stats ──────────────────────────────────────────────
public record AdminReportStatsDto(
  int Open,
  int Resolved,
  int Dismissed
);

// ── GET /api/admin/reports/{id} ───────────────────────────────────────────────
public record AdminReportDetailDto(
  Guid Id,
  Guid FeedbackId,
  string Status,
  string Reason,
  DateTime CreatedAt,
  DateTime? ResolvedAt,
  Guid ReporterId,
  string ReporterDisplayName,
  AdminReportFeedbackDto Feedback
);

// Submitter ist im Moderations-Kontext auch bei anonymen Feedbacks sichtbar —
// sonst koennte der Admin wiederholten Missbrauch nicht pruefen.
public record AdminReportFeedbackDto(
  Guid Id,
  bool IsAnonymous,
  bool IsEdited,
  bool IsDeleted,
  SubmitterInfo Submitter,
  Guid RecipientId,
  string RecipientDisplayName,
  DateOnly SubmittedDate,
  DateTime SubmittedAt,
  string? Strengths,
  string? AreasToImprove,
  List<RatingResponse> Ratings
);

// ── PATCH /api/admin/reports/{id}/status ──────────────────────────────────────
public record UpdateReportStatusRequest(string Status);

// ── POST /api/admin/reports/{id}/action ───────────────────────────────────────
// HrIntervention/HrEscalation/Notes werden akzeptiert aber nicht persistiert (Post-IPA).
public record ReportActionRequest(
  string Action,
  string Reason,
  bool HrIntervention,
  bool HrEscalation,
  string? Notes
);
