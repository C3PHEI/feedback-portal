using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;
using feedbackhub.Data;
using feedbackhub.Models;

namespace feedbackhub.Controllers;

[ApiController]
[Route("api/me")]
[Authorize]
public class MeController : ControllerBase
{
  private readonly AppDbContext _db;
  private readonly ILogger<MeController> _logger;

  public MeController(AppDbContext db, ILogger<MeController> logger)
  {
    _db = db;
    _logger = logger;
  }

  [HttpGet]
  [RequiredScope("access_as_user")]
  public async Task<IActionResult> Get()
  {
    // ── 1. Identitaet aus JWT-Claims lesen ──────────────────────────────
    var oid = User.FindFirst("oid")?.Value
              ?? User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

    if (string.IsNullOrEmpty(oid))
      return Unauthorized(new { error = "missing_oid_claim" });

    // ── 2. Bestehenden User suchen ──────────────────────────────────────
    var user = await _db.Users
      .Include(u => u.Department)
      .FirstOrDefaultAsync(u => u.AdObjectId == oid);

    // ── 3. Auto-Provisioning bei Erst-Login ─────────────────────────────
    if (user == null)
    {
      var displayName = User.FindFirst("name")?.Value
                        ?? User.Identity?.Name
                        ?? "Unbekannter Benutzer";

      var email = User.FindFirst("preferred_username")?.Value
                  ?? User.FindFirst("upn")?.Value
                  ?? User.FindFirst("email")?.Value
                  ?? string.Empty;

      // Email ist NOT NULL in der DB — ohne keinen Account anlegen
      if (string.IsNullOrEmpty(email))
      {
        _logger.LogWarning("Auto-Provisioning fehlgeschlagen: kein E-Mail-Claim fuer oid {Oid}", oid);
        return BadRequest(new { error = "missing_email_claim" });
      }

      // Edge-Case: gleicher User mit altem oid → Konflikt auf email-Spalte
      var emailExists = await _db.Users.AnyAsync(u => u.Email == email);
      if (emailExists)
      {
        _logger.LogWarning("Auto-Provisioning fehlgeschlagen: E-Mail {Email} existiert bereits mit anderem oid", email);
        return Conflict(new { error = "email_already_exists" });
      }

      var (firstName, lastName) = SplitDisplayName(displayName);
      var now = DateTime.UtcNow;

      user = new User
      {
        Id                  = Guid.NewGuid(),
        AdObjectId          = oid,
        DisplayName         = displayName,
        Email               = email,
        FirstName           = firstName,
        LastName            = lastName,
        DepartmentId        = null,        // Admin weist spaeter zu
        Role                = "user",      // SICHERHEIT: niemals admin/manager auto
        IsDepartmentManager = false,
        IsActive            = true,
        CreatedAt           = now,
        UpdatedAt           = now
      };

      _db.Users.Add(user);
      await _db.SaveChangesAsync();

      _logger.LogInformation("Auto-Provisioned neuer User {Email} (oid {Oid})", email, oid);
    }

    // ── 4. Deaktivierte User abweisen ───────────────────────────────────
    if (!user.IsActive)
      return Forbid();

    // ── 5. Profil-DTO zurueckgeben ──────────────────────────────────────
    return Ok(new
    {
      id                  = user.Id,
      displayName         = user.DisplayName,
      email               = user.Email,
      role                = user.Role,
      isDepartmentManager = user.IsDepartmentManager,
      department          = user.Department == null ? null : new
      {
        id   = user.Department.Id,
        name = user.Department.Name
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private static (string? FirstName, string? LastName) SplitDisplayName(string displayName)
  {
    if (string.IsNullOrWhiteSpace(displayName))
      return (null, null);

    var parts = displayName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (parts.Length == 1) return (parts[0], null);

    var first = parts[0];
    var last  = string.Join(' ', parts[1..]);
    return (first, last);
  }
}
