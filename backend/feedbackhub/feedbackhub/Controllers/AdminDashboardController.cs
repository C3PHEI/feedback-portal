using feedbackhub.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

/// <summary>
/// Admin-Dashboard — liefert ausschliesslich aggregierte Daten.
/// Quelle: feedback_hub_endpoints.txt → "ADMIN — DASHBOARD"
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize]
[RequiredScope("access_as_user")]
public class AdminDashboardController : ControllerBase
{
    private readonly AdminDashboardService _service;
    private readonly CurrentUserService    _currentUser;

    public AdminDashboardController(
        AdminDashboardService service,
        CurrentUserService currentUser)
    {
        _service     = service;
        _currentUser = currentUser;
    }

    // GET /api/admin/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetStatsAsync());
    }

    // GET /api/admin/charts/activity
    [HttpGet("charts/activity")]
    public async Task<IActionResult> GetChartActivity()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetChartActivityAsync());
    }

    // GET /api/admin/charts/visibility
    [HttpGet("charts/visibility")]
    public async Task<IActionResult> GetChartVisibility()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetChartVisibilityAsync());
    }

    // GET /api/admin/driver-averages
    [HttpGet("driver-averages")]
    public async Task<IActionResult> GetDriverAverages()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetDriverAveragesAsync());
    }

    // GET /api/admin/departments/stats
    [HttpGet("departments/stats")]
    public async Task<IActionResult> GetDepartmentStats()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetDepartmentStatsAsync());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private async Task<bool> IsAdminAsync()
    {
        var me = await _currentUser.GetAsync();
        return me != null && me.Role == "admin";
    }
}
