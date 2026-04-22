using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;
using feedbackhub.Data;

namespace feedbackhub.Controllers;

[ApiController]
[Route("api/me")]
[Authorize]
public class MeController : ControllerBase
{
  private readonly AppDbContext _db;

  public MeController(AppDbContext db)
  {
    _db = db;
  }

  [HttpGet]
  [RequiredScope("access_as_user")]
  public async Task<IActionResult> Get()
  {
    var oid = User.FindFirst("oid")?.Value
              ?? User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

    if (oid == null) return Unauthorized();

    var user = await _db.Users
      .Include(u => u.Department)
      .FirstOrDefaultAsync(u => u.AdObjectId == oid);

    if (user == null) return NotFound(new { error = "user_not_found" });
    if (!user.IsActive) return Forbid();

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
}
