using feedbackhub.Dtos;
using feedbackhub.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

/// <summary>
/// Admin — Benutzerverwaltung (admin.html Tab 3).
/// Quelle: feedback_hub_endpoints.txt → "ADMIN — USER-VERWALTUNG"
/// </summary>
[ApiController]
[Route("api/admin/users")]
[Authorize]
[RequiredScope("access_as_user")]
public class AdminUserController : ControllerBase
{
    private readonly AdminUserService   _service;
    private readonly CurrentUserService _currentUser;

    public AdminUserController(
        AdminUserService service,
        CurrentUserService currentUser)
    {
        _service     = service;
        _currentUser = currentUser;
    }

    // GET /api/admin/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (!await IsAdminAsync()) return Forbid();
        return Ok(await _service.GetAllAsync());
    }

    // PATCH /api/admin/users/{id}/role
    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateUserRoleRequest req)
    {
        var me = await RequireAdminAsync();
        if (me == null) return Forbid();

        var result = await _service.UpdateRoleAsync(id, me.Id, req.Role);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return NoContent();
    }

    // PATCH /api/admin/users/{id}/department
    [HttpPatch("{id:guid}/department")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] UpdateUserDepartmentRequest req)
    {
        if (!await IsAdminAsync()) return Forbid();

        var result = await _service.UpdateDepartmentAsync(id, req.DepartmentId);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return NoContent();
    }

    // POST /api/admin/users/{id}/deactivate
    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var me = await RequireAdminAsync();
        if (me == null) return Forbid();

        var result = await _service.DeactivateAsync(id, me.Id);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return NoContent();
    }

    // POST /api/admin/users/{id}/activate
    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        if (!await IsAdminAsync()) return Forbid();

        var result = await _service.ActivateAsync(id);
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

    private async Task<Models.User?> RequireAdminAsync()
    {
        var me = await _currentUser.GetAsync();
        return me != null && me.Role == "admin" ? me : null;
    }
}
