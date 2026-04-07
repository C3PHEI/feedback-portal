using feedbackhub;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")]
public class DbTestController : ControllerBase
{
  private readonly AppDbContext _db;

  public DbTestController(AppDbContext db)
  {
    _db = db;
  }

  [HttpGet("ping")]
  public async Task<IActionResult> Ping()
  {
    try
    {
      var canConnect = await _db.Database.CanConnectAsync();
      if (canConnect)
        return Ok(new { status = "ok", message = "Datenbankverbindung erfolgreich!" });
      else
        return StatusCode(500, new { status = "error", message = "Verbindung fehlgeschlagen." });
    }
    catch (Exception ex)
    {
      return StatusCode(500, new { status = "error", message = ex.Message });
    }
  }
}
