using feedbackhub.Data;
using feedbackhub.Dtos;
using feedbackhub.Models;
using Microsoft.EntityFrameworkCore;

namespace feedbackhub.Services;

/// <summary>
/// User-Verwaltung fuer Admin-Panel Tab 3.
/// Alle Methoden setzen voraus, dass der Controller bereits Admin-Rechte geprueft hat.
/// </summary>
public class AdminUserService
{
    private static readonly string[] AllowedRoles = { "user", "manager", "admin" };

    private readonly AppDbContext _db;

    public AdminUserService(AppDbContext db)
    {
        _db = db;
    }

    // ── User-Liste mit Feedback-Stats ─────────────────────────────────────────

    public async Task<IReadOnlyList<AdminUserDto>> GetAllAsync()
    {
        // Counts pro User in zwei Queries (received / given), dann im Memory gemappt.
        // is_deleted=false zaehlt — Feedbacks im Legal-Hold bleiben sichtbar.
        var received = await _db.Feedbacks
            .Where(f => !f.IsDeleted)
            .GroupBy(f => f.RecipientId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var given = await _db.Feedbacks
            .Where(f => !f.IsDeleted)
            .GroupBy(f => f.SubmitterId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var users = await _db.Users
            .Include(u => u.Department)
            .OrderBy(u => u.DisplayName)
            .ToListAsync();

        return users.Select(u => new AdminUserDto(
            Id:                  u.Id,
            DisplayName:         u.DisplayName,
            Email:               u.Email,
            Role:                u.Role,
            IsActive:            u.IsActive,
            IsDepartmentManager: u.IsDepartmentManager,
            DeactivatedAt:       u.DeactivatedAt,
            DepartmentId:        u.DepartmentId,
            DepartmentName:      u.Department?.Name,
            FeedbackReceived:    received.TryGetValue(u.Id, out var r) ? r : 0,
            FeedbackGiven:       given.TryGetValue(u.Id, out var g)    ? g : 0
        )).ToList();
    }

    // ── Rolle aendern ─────────────────────────────────────────────────────────

    public async Task<ServiceResult> UpdateRoleAsync(Guid userId, Guid currentAdminId, string newRole)
    {
        if (!AllowedRoles.Contains(newRole))
            return new ServiceResult(false, "invalid_role");

        // Admin kann sich nicht selbst degradieren — sonst Lockout-Risiko
        if (userId == currentAdminId)
            return new ServiceResult(false, "cannot_modify_self");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return new ServiceResult(false, "user_not_found");

        user.Role = newRole;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }

    // ── Abteilung aendern ─────────────────────────────────────────────────────

    public async Task<ServiceResult> UpdateDepartmentAsync(Guid userId, Guid? departmentId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return new ServiceResult(false, "user_not_found");

        if (departmentId.HasValue)
        {
            var exists = await _db.Departments.AnyAsync(d => d.Id == departmentId.Value);
            if (!exists) return new ServiceResult(false, "department_not_found");
        }

        user.DepartmentId = departmentId;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }

    // ── Deaktivieren ──────────────────────────────────────────────────────────
    // Startet den 12-Monate-Retention-Countdown [HRU].
    public async Task<ServiceResult> DeactivateAsync(Guid userId, Guid currentAdminId)
    {
        // Admin darf sich nicht selbst deaktivieren
        if (userId == currentAdminId)
            return new ServiceResult(false, "cannot_modify_self");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return new ServiceResult(false, "user_not_found");
        if (!user.IsActive) return new ServiceResult(false, "already_inactive");

        user.IsActive = false;
        user.DeactivatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }

    // ── Reaktivieren ──────────────────────────────────────────────────────────
    // Setzt DeactivatedAt=null → Retention-Countdown wird zurueckgesetzt [HRU].
    public async Task<ServiceResult> ActivateAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return new ServiceResult(false, "user_not_found");
        if (user.IsActive) return new ServiceResult(false, "already_active");

        user.IsActive = true;
        user.DeactivatedAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return new ServiceResult(true);
    }
}
