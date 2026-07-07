using feedbackhub.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

/// <summary>
/// Admin — AD-Sync manuell auslösen und Status abfragen.
/// Der reguläre Lauf erfolgt täglich über AdSyncBackgroundService;
/// dieser Endpoint dient zum Testen, Vorführen und für Ad-hoc-Syncs
/// (z. B. direkt nach einer Gruppenänderung im AD).
/// </summary>
[ApiController]
[Route("api/admin/sync")]
[Authorize]
[RequiredScope("access_as_user")]
public class AdminSyncController : ControllerBase
{
  private readonly AdSyncService _syncService;
  private readonly AdSyncStatusStore _status;
  private readonly CurrentUserService _currentUser;

  public AdminSyncController(
    AdSyncService syncService,
    AdSyncStatusStore status,
    CurrentUserService currentUser)
  {
    _syncService = syncService;
    _status = status;
    _currentUser = currentUser;
  }

  // POST /api/admin/sync/run — Sync sofort ausführen
  [HttpPost("run")]
  public async Task<IActionResult> Run(CancellationToken ct)
  {
    if (!await IsAdminAsync()) return Forbid();

    var result = await _syncService.RunAsync(ct);
    _status.LastResult = result;

    if (!result.Success)
      return StatusCode(StatusCodes.Status502BadGateway, result);

    return Ok(result);
  }

  // GET /api/admin/sync/status — Ergebnis des letzten Laufs
  [HttpGet("status")]
  public async Task<IActionResult> Status()
  {
    if (!await IsAdminAsync()) return Forbid();

    var last = _status.LastResult;
    if (last == null)
      return Ok(new { message = "Noch kein Sync-Lauf seit dem letzten App-Start." });

    return Ok(last);
  }

  // ── Helpers (gleiches Muster wie AdminUserController) ──────────────────

  private async Task<bool> IsAdminAsync()
  {
    var me = await _currentUser.GetAsync();
    return me != null && me.Role == "admin";
  }
}
