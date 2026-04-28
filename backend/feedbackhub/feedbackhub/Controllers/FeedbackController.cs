using feedbackhub.Data;
using feedbackhub.Dtos;
using feedbackhub.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
[RequiredScope("access_as_user")]
public class FeedbackController : ControllerBase
{
    private readonly FeedbackService _service;
    private readonly AppDbContext    _db;

    public FeedbackController(FeedbackService service, AppDbContext db)
    {
        _service = service;
        _db      = db;
    }

    // POST /api/feedback
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitFeedbackRequest req)
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        var result = await _service.SubmitAsync(user.Id, req);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return Created($"/api/feedback/{result.Data}", new { id = result.Data });
    }

    // GET /api/feedback/inbox
    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        return Ok(await _service.GetInboxAsync(user.Id));
    }

    // GET /api/feedback/inbox/averages
    [HttpGet("inbox/averages")]
    public async Task<IActionResult> GetInboxAverages()
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        return Ok(await _service.GetInboxAveragesAsync(user.Id));
    }

    // GET /api/feedback/history
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        return Ok(await _service.GetHistoryAsync(user.Id));
    }

    // GET /api/feedback/can-submit-anonymous/{recipientId}
    // Muss VOR {id:guid} stehen, sonst matched ASP.NET Core das als ID-Route
    [HttpGet("can-submit-anonymous/{recipientId:guid}")]
    public async Task<IActionResult> CanSubmitAnonymous(Guid recipientId)
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        return Ok(await _service.CanSubmitAnonymousAsync(user.Id, recipientId));
    }

    // GET /api/feedback/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        var result = await _service.GetByIdAsync(id, user.Id);
        return result == null ? NotFound() : Ok(result);
    }

    // PUT /api/feedback/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFeedbackRequest req)
    {
      var user = await ResolveCurrentUserAsync();
      if (user == null) return Unauthorized();

      var result = await _service.UpdateAsync(id, user.Id, req);
      if (!result.Success)
      {
        return result.Error switch
        {
          "not_found"           => NotFound(),
          "forbidden"           => Forbid(),
          "already_edited"      => Conflict(new { error = result.Error }),    // NEU
          "edit_window_expired" => BadRequest(new { error = result.Error }),
          _                     => BadRequest(new { error = result.Error })
        };
      }

      return NoContent();
    }

    // POST /api/feedback/{id}/report
    [HttpPost("{id:guid}/report")]
    public async Task<IActionResult> Report(Guid id, [FromBody] ReportFeedbackRequest req)
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null) return Unauthorized();

        var result = await _service.ReportAsync(id, user.Id, req);
        if (!result.Success)
        {
            return result.Error switch
            {
                "not_found"        => NotFound(),
                "forbidden"        => Forbid(),
                "already_reported" => Conflict(new { error = result.Error }),
                _                  => BadRequest(new { error = result.Error })
            };
        }

        return NoContent();
    }

    // ── Private Helper ────────────────────────────────────────────────────────

    private async Task<feedbackhub.Models.User?> ResolveCurrentUserAsync()
    {
        var oid = User.FindFirst("oid")?.Value
                  ?? User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

        if (oid == null) return null;

        return await _db.Users.FirstOrDefaultAsync(u => u.AdObjectId == oid && u.IsActive);
    }
}
