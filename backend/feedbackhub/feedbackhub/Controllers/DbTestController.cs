using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
  // Den eingeloggten User auslesen — IMMER "oid" verwenden, nicht "sub"!
  private string? GetCurrentUserId()
  {
    return User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier");
  }
}
