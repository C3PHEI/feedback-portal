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

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/users/recipients
    [HttpGet("recipients")]
    public async Task<IActionResult> GetRecipients()
    {
        var me = await ResolveCurrentUserAsync();
        if (me == null) return Unauthorized();

        var recipients = await _db.Users
            .Where(u => u.IsActive && u.Id != me.Id)
            .OrderBy(u => u.DisplayName)
            .Select(u => new RecipientDto(u.Id, u.DisplayName))
            .ToListAsync();

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
