namespace feedbackhub.Dtos;

// ── Shared Result Pattern ─────────────────────────────────────────────────────

public record ServiceResult(bool Success, string? Error = null);
public record ServiceResult<T>(bool Success, T? Data, string? Error = null);

// ── Requests ──────────────────────────────────────────────────────────────────

public record RatingRequest(Guid DriverId, int? Score, bool IsNa);

public record SubmitFeedbackRequest(
    Guid RecipientId,
    bool IsAnonymous,
    bool CocConfirmed,
    List<RatingRequest> Ratings,
    string? Strengths,
    string? AreasToImprove
);

public record UpdateFeedbackRequest(
    List<RatingRequest> Ratings,
    string? Strengths,
    string? AreasToImprove
);

public record ReportFeedbackRequest(string Reason);

// ── Responses ─────────────────────────────────────────────────────────────────

public record SubmitterInfo(Guid Id, string DisplayName);

public record RatingResponse(Guid DriverId, string DriverName, int? Score, bool IsNa);

// Inbox-Eintrag. Bei anonymen Feedbacks sind Submitter und SubmittedAt null.
public record InboxFeedbackResponse(
    Guid Id,
    bool IsAnonymous,
    bool IsEdited,
    SubmitterInfo? Submitter,     // null wenn IsAnonymous
    DateOnly SubmittedDate,
    DateTime? SubmittedAt,        // null wenn IsAnonymous (Datenschutz)
    string? Strengths,
    string? AreasToImprove,
    List<RatingResponse> Ratings
);

public record DriverAverageResponse(Guid DriverId, string DriverName, double? Average);

public record InboxAveragesResponse(
    int TotalReviews,
    int AnonymousCount,
    List<DriverAverageResponse> DriverAverages
);

// History-Eintrag. IsLocked=true bedeutet das 5-Minuten-Editierfenster ist abgelaufen.
public record HistoryFeedbackResponse(
    Guid Id,
    Guid RecipientId,
    string RecipientName,
    bool IsAnonymous,
    bool IsEdited,
    bool IsLocked,
    DateOnly SubmittedDate,
    DateTime SubmittedAt,
    string? Strengths,
    string? AreasToImprove,
    List<RatingResponse> Ratings
);

// Detail-Ansicht eines Feedbacks. Nur für Sender oder Empfänger zugänglich.
// Bei anonymen Feedbacks aus Empfängerperspektive sind Submitter und SubmittedAt null.
public record FeedbackDetailResponse(
    Guid Id,
    bool IsAnonymous,
    bool IsEdited,
    SubmitterInfo? Submitter,
    Guid RecipientId,
    string RecipientName,
    DateOnly SubmittedDate,
    DateTime? SubmittedAt,
    string? Strengths,
    string? AreasToImprove,
    List<RatingResponse> Ratings
);

public record CanSubmitAnonymousResponse(bool Allowed, DateTime? NextPossibleAt);
