namespace feedbackhub.DTOs;

// GET /api/departments
public record DepartmentDto(
  Guid Id,
  string Name
);

// GET /api/departments/my-team
public record TeamMemberDto(
  Guid Id,
  string DisplayName,
  string Role,
  double? AvgRating,      // Gesamtschnitt ueber alle Driver, null wenn keine Ratings
  int FeedbackCount,      // Anzahl erhaltener Feedbacks (ohne deleted)
  int AnonymousCount      // davon anonym (fuer Icon-Badge)
);

// GET /api/departments/my-team/averages
public record TeamDriverAverageDto(
  Guid DriverId,
  string DriverName,
  double? Average,        // null wenn nur N/A-Ratings
  int ReviewCount,
  bool LowReviewWarning   // true wenn ReviewCount <= 2
);

public record TeamAveragesDto(
  int TotalReviews,
  int AnonymousCount,
  IReadOnlyList<TeamDriverAverageDto> Drivers
);

// GET /api/departments/my-team/{userId}/feedbacks
// WICHTIG: Bei IsAnonymous=true kein SubmittedAt, nur SubmittedDate
public record TeamMemberFeedbackDto(
  Guid Id,
  SubmitterDto? Submitter,         // null wenn anonym
  bool IsAnonymous,
  DateTime SubmittedDate,          // Entity hat DateTime, Frontend formatiert nur Datum
  DateTime? SubmittedAt,           // NUR wenn NICHT anonym
  string? Strengths,
  string? AreasToImprove,
  bool IsEdited,
  IReadOnlyList<FeedbackRatingDto> Ratings
);

public record SubmitterDto(
  Guid Id,
  string DisplayName
);

public record FeedbackRatingDto(
  Guid DriverId,
  string DriverName,
  int? Score,
  bool IsNa
);
