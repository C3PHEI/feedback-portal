using feedbackhub.Dtos;
using feedbackhub.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize]
[RequiredScope("access_as_user")]
public class AdminModerationController : ControllerBase
{
    private readonly AdminModerationService _service;
    private readonly CurrentUserService     _currentUser;

    public AdminModerationController(
        AdminModerationService service,
        CurrentUserService currentUser)
    {
        _service     = service;
        _currentUser = currentUser;
    }

    // GET /api/admin/reports?status=open&search=FB-0486
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetReportsAsync(status, search));
    }

    // GET /api/admin/reports/stats
    // Muss VOR {id:guid} stehen, sonst wird "stats" als ID interpretiert.
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetStatsAsync());
    }

    // GET /api/admin/reports/{id}
    // [ADMIN]: Audit-Log-Eintrag — Post-IPA.
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        if (!await IsAdminAsync()) return Forbid();

        var result = await _service.GetByIdAsync(id);
        return result == null
            ? NotFound(new { error = "report_not_found" })
            : Ok(result);
    }

    // PATCH /api/admin/reports/{id}/status
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReportStatusRequest req)
    {
        if (!await IsAdminAsync()) return Forbid();

        var result = await _service.UpdateStatusAsync(id, req.Status);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return NoContent();
    }

    // POST /api/admin/reports/{id}/action
    [HttpPost("{id:guid}/action")]
    public async Task<IActionResult> ApplyAction(Guid id, [FromBody] ReportActionRequest req)
    {
        if (!await IsAdminAsync()) return Forbid();

        var result = await _service.ApplyActionAsync(id, req);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return NoContent();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private async Task<bool> IsAdminAsync()
    {
        var me = await _currentUser.GetAsync();
        return me != null && me.Role == "admin";
    }
}
