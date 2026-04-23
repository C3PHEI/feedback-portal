using feedbackhub.Data;
using feedbackhub.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace feedbackhub.Services;

/// <summary>
/// Resolves the currently authenticated user from the HTTP context
/// and loads the corresponding User entity from the database.
/// Registered as Scoped — result is cached for the duration of the request.
/// </summary>
public class CurrentUserService
{
  private const string OidClaim      = "oid";
  private const string OidClaimLong  = "http://schemas.microsoft.com/identity/claims/objectidentifier";

  private readonly AppDbContext _db;
  private readonly IHttpContextAccessor _httpContext;

  private User? _cachedUser;
  private bool _hasResolved;

  public CurrentUserService(AppDbContext db, IHttpContextAccessor httpContext)
  {
    _db = db;
    _httpContext = httpContext;
  }

  /// <summary>
  /// Returns the current user (with Department included) or null if
  /// not authenticated, not found in DB, or deactivated.
  /// </summary>
  public async Task<User?> GetAsync()
  {
    if (_hasResolved) return _cachedUser;
    _hasResolved = true;

    var principal = _httpContext.HttpContext?.User;
    if (principal?.Identity?.IsAuthenticated != true) return null;

    var oid = principal.FindFirst(OidClaim)?.Value
              ?? principal.FindFirst(OidClaimLong)?.Value;

    if (string.IsNullOrEmpty(oid)) return null;

    _cachedUser = await _db.Users
      .Include(u => u.Department)
      .FirstOrDefaultAsync(u => u.AdObjectId == oid && u.IsActive);

    return _cachedUser;
  }

  /// <summary>
  /// Returns just the current user's Id, or null if not authenticated.
  /// </summary>
  public async Task<Guid?> GetIdAsync()
  {
    var user = await GetAsync();
    return user?.Id;
  }
}
