using feedbackhub.Data;
using feedbackhub.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
[RequiredScope("access_as_user")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    // Display-Name-Muster für technische/administrative Konten (z. B. ADMA),
    // die nicht als Feedback-Empfänger auswählbar sein sollen. Überschreibbar
    // via appsettings "Recipients:ExcludedDisplayNamePatterns".
    private static readonly string[] DefaultExcludedPatterns = { "ADMA" };

    public UsersController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // GET /api/users/recipients
    [HttpGet("recipients")]
    public async Task<IActionResult> GetRecipients()
    {
        var me = await ResolveCurrentUserAsync();
        if (me == null) return Unauthorized();

        var excludedPatterns = _config.GetSection("Recipients:ExcludedDisplayNamePatterns")
                                   .Get<string[]>() ?? DefaultExcludedPatterns;

        var candidates = await _db.Users
            .Where(u => u.IsActive && u.Id != me.Id)
            .OrderBy(u => u.DisplayName)
            .Select(u => new { u.Id, u.DisplayName })
            .ToListAsync();

        // Konten mit ADMA-artigem Anzeigenamen herausfiltern (wie das eigene
        // Konto bereits ausgeschlossen ist). In-Memory, damit mehrere Muster
        // case-insensitiv geprüft werden können.
        var recipients = candidates
            .Where(u => !excludedPatterns.Any(p =>
                !string.IsNullOrWhiteSpace(p) &&
                u.DisplayName.Contains(p, StringComparison.OrdinalIgnoreCase)))
            .Select(u => new RecipientDto(u.Id, u.DisplayName))
            .ToList();

        return Ok(recipients);
    }

    private async Task<feedbackhub.Models.User?> ResolveCurrentUserAsync()
    {
        var oid = User.FindFirst("oid")?.Value
                  ?? User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

        if (oid == null) return null;

        return await _db.Users.FirstOrDefaultAsync(u => u.AdObjectId == oid && u.IsActive);
    }
}
