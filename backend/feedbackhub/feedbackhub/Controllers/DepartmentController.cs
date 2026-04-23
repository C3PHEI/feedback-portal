using feedbackhub.DTOs;
using feedbackhub.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace feedbackhub.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize]
[RequiredScope("access_as_user")]
public class DepartmentsController : ControllerBase
{
  private readonly DepartmentService _service;

  public DepartmentsController(DepartmentService service)
  {
    _service = service;
  }

  // GET /api/departments
  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<DepartmentDto>>> GetAll()
  {
    var departments = await _service.GetAllAsync();
    return Ok(departments);
  }

  // GET /api/departments/my-team
  [HttpGet("my-team")]
  public async Task<ActionResult<IReadOnlyList<TeamMemberDto>>> GetMyTeam()
  {
    var result = await _service.GetMyTeamAsync();
    return ToActionResult(result);
  }

  // GET /api/departments/my-team/averages
  [HttpGet("my-team/averages")]
  public async Task<ActionResult<TeamAveragesDto>> GetMyTeamAverages()
  {
    var result = await _service.GetMyTeamAveragesAsync();
    return ToActionResult(result);
  }

  // GET /api/departments/my-team/{userId}/feedbacks
  [HttpGet("my-team/{userId:guid}/feedbacks")]
  public async Task<ActionResult<IReadOnlyList<TeamMemberFeedbackDto>>> GetTeamMemberFeedbacks(Guid userId)
  {
    var result = await _service.GetTeamMemberFeedbacksAsync(userId);
    return ToActionResult(result);
  }

  // -----------------------------------------------------------------
  // Mapping ServiceResult → HTTP Status
  // -----------------------------------------------------------------
  private ActionResult<T> ToActionResult<T>(ServiceResult<T> result)
  {
    if (result.Success) return Ok(result.Data);

    return result.Error switch
    {
      "Unauthorized" => Unauthorized(),
      "Forbidden"    => Forbid(),
      "NotFound"     => NotFound(),
      _              => BadRequest(new { error = result.Error })
    };
  }
}
