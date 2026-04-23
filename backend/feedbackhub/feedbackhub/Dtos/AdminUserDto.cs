namespace feedbackhub.Dtos;

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Volle User-Liste fuer die Benutzerverwaltung im Admin-Panel.
// FeedbackReceived/Sent zaehlen nur nicht-geloeschte Feedbacks.
public record AdminUserDto(
  Guid Id,
  string DisplayName,
  string Email,
  string Role,                    // "admin" | "manager" | "user"
  bool IsActive,
  bool IsDepartmentManager,
  DateTime? DeactivatedAt,        // fuer Retention-Countdown-Anzeige
  Guid? DepartmentId,
  string? DepartmentName,
  int FeedbackReceived,
  int FeedbackGiven
);

// ── PATCH /api/admin/users/{id}/role ──────────────────────────────────────────
// CHECK-Constraint auf DB-Seite: role IN ('user', 'manager', 'admin')
public record UpdateUserRoleRequest(string Role);

// ── PATCH /api/admin/users/{id}/department ────────────────────────────────────
// departmentId=null = User aus Abteilung entfernen (users.department_id ist nullable)
public record UpdateUserDepartmentRequest(Guid? DepartmentId);
