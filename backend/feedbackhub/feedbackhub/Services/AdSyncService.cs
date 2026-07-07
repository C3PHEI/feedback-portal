using Azure.Identity;
using feedbackhub.Data;
using feedbackhub.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
// Alias, weil Microsoft.Graph.Models.User mit feedbackhub.Models.User kollidiert:
using GraphUser = Microsoft.Graph.Models.User;

namespace feedbackhub.Services;

/// <summary>
/// Ergebnis eines Sync-Laufs — wird geloggt, im StatusStore abgelegt
/// und vom manuellen Trigger-Endpoint zurückgegeben.
/// </summary>
public record AdSyncResult(
  bool Success,
  string? Error,
  int Created,
  int Updated,
  int Reactivated,
  int Deactivated,
  int Skipped,
  DateTime StartedAt,
  DateTime FinishedAt
);

/// <summary>
/// Täglicher Benutzer-Sync aus Entra ID (Microsoft Graph).
/// Quelle: homepage-retention-usersync.txt →
///   "Daily automated sync job: Pull users from AD (OU or Group) with the
///    filters, New Users = create, Existing users = Update attributes,
///    Missing users = tag them as 'inactive'"
///
/// Regeln:
///   - Scope   = Mitglieder der Gruppe G_FeedbackHub          (AdSync:UserGroupId)
///   - Rolle   = admin  wenn Mitglied in G_FeedbackHub_Admin   (AdSync:AdminGroupId)
///             = manager wenn Mitglied in G_FeedbackHub_Manager (AdSync:ManagerGroupId)
///             = user   sonst
///   - Manager-Flag  = Mitgliedschaft in G_FeedbackHub_Manager
///   - Department    = AD-Attribut "department" (auto-create in departments-Tabelle)
///   - Filter 2 der Spezifikation: mail + displayName müssen gesetzt sein
///   - Fehlende / in AD deaktivierte User → is_active=false, deactivated_at=now
///     (startet den 12-Monate-Retention-Countdown)
///   - Lockout-Schutz: bliebe nach dem Sync kein aktiver Admin übrig,
///     wird der komplette Lauf verworfen.
/// </summary>
public class AdSyncService
{
  private readonly AppDbContext _db;
  private readonly IConfiguration _config;
  private readonly ILogger<AdSyncService> _logger;

  // Department-Name → Id, damit pro Lauf jedes Department nur 1x aufgelöst wird
  private readonly Dictionary<string, Guid> _deptCache = new(StringComparer.OrdinalIgnoreCase);

  public AdSyncService(AppDbContext db, IConfiguration config, ILogger<AdSyncService> logger)
  {
    _db = db;
    _config = config;
    _logger = logger;
  }

  public async Task<AdSyncResult> RunAsync(CancellationToken ct = default)
  {
    var startedAt = DateTime.UtcNow;
    int created = 0, updated = 0, reactivated = 0, deactivated = 0, skipped = 0;

    AdSyncResult Fail(string error)
    {
      _logger.LogError("AD-Sync abgebrochen: {Error}", error);
      return new AdSyncResult(false, error, created, updated, reactivated, deactivated, skipped, startedAt, DateTime.UtcNow);
    }

    // ── 1. Konfiguration lesen ──────────────────────────────────────────
    // TenantId/ClientId werden aus der bestehenden AzureAd-Sektion
    // wiederverwendet, das Secret + die Gruppen-IDs kommen aus "AdSync".
    var tenantId       = _config["AdSync:TenantId"] ?? _config["AzureAd:TenantId"];
    var clientId       = _config["AdSync:ClientId"] ?? _config["AzureAd:ClientId"];
    var clientSecret   = _config["AdSync:ClientSecret"];
    var userGroupId    = _config["AdSync:UserGroupId"];
    var managerGroupId = _config["AdSync:ManagerGroupId"];
    var adminGroupId   = _config["AdSync:AdminGroupId"];

    if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId) ||
        string.IsNullOrWhiteSpace(clientSecret) || string.IsNullOrWhiteSpace(userGroupId) ||
        string.IsNullOrWhiteSpace(managerGroupId) || string.IsNullOrWhiteSpace(adminGroupId))
      return Fail("missing_configuration (AdSync:ClientSecret / UserGroupId / ManagerGroupId / AdminGroupId)");

    // ── 2. Graph-Client (Client-Credentials-Flow, App-Identität) ───────
    var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    var graph = new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });

    List<GraphUser> adUsers;
    HashSet<string> managerOids, adminOids;
    try
    {
      adUsers     = await GetGroupUsersAsync(graph, userGroupId, ct);
      managerOids = (await GetGroupUsersAsync(graph, managerGroupId, ct))
                    .Where(u => u.Id != null).Select(u => u.Id!).ToHashSet();
      adminOids   = (await GetGroupUsersAsync(graph, adminGroupId, ct))
                    .Where(u => u.Id != null).Select(u => u.Id!).ToHashSet();
    }
    catch (Exception ex)
    {
      return Fail($"graph_error: {ex.Message}");
    }

    // Sicherung: leere Scope-Gruppe wäre fast sicher ein Konfigurationsfehler
    // und würde ALLE User deaktivieren → Lauf abbrechen.
    if (adUsers.Count == 0)
      return Fail("user_group_empty — Sync abgebrochen, um Massen-Deaktivierung zu verhindern");

    // ── 3. Upsert: Neue anlegen / Bestehende aktualisieren ─────────────
    var dbUsers = await _db.Users.ToListAsync(ct);
    var byOid   = dbUsers.ToDictionary(u => u.AdObjectId);
    var now     = DateTime.UtcNow;
    var seenOids = new HashSet<string>();

    foreach (var gu in adUsers)
    {
      if (string.IsNullOrWhiteSpace(gu.Id)) { skipped++; continue; }

      // Filter 2 der Spezifikation: mail nicht leer, displayName gesetzt
      // (schliesst Bot-/Ressourcen-Konten wie Drucker aus)
      var email = gu.Mail ?? gu.UserPrincipalName;
      if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(gu.DisplayName))
      {
        _logger.LogWarning("AD-Sync: Konto {Oid} übersprungen (mail/displayName fehlt)", gu.Id);
        skipped++;
        continue;
      }

      // In AD deaktivierte Konten NICHT in seenOids aufnehmen →
      // werden in Schritt 4 wie "fehlend" behandelt (inactive + Countdown).
      if (gu.AccountEnabled == false) { skipped++; continue; }

      seenOids.Add(gu.Id);

      var role = adminOids.Contains(gu.Id)   ? "admin"
               : managerOids.Contains(gu.Id) ? "manager"
               : "user";
      var isManager = managerOids.Contains(gu.Id);
      var deptId    = await ResolveDepartmentAsync(gu.Department, now, ct);

      if (byOid.TryGetValue(gu.Id, out var user))
      {
        // ── Bestehender User: Attribute aus AD überschreiben ──
        var changed = false;

        if (user.DisplayName != gu.DisplayName)      { user.DisplayName = gu.DisplayName!;      changed = true; }
        if (user.Email != email)                     { user.Email = email;                      changed = true; }
        if (user.FirstName != gu.GivenName)          { user.FirstName = gu.GivenName;           changed = true; }
        if (user.LastName != gu.Surname)             { user.LastName = gu.Surname;              changed = true; }
        if (user.DepartmentId != deptId)             { user.DepartmentId = deptId;              changed = true; }
        if (user.Role != role)                       { user.Role = role;                        changed = true; }
        if (user.IsDepartmentManager != isManager)   { user.IsDepartmentManager = isManager;    changed = true; }

        if (!user.IsActive)
        {
          // Wieder aktiv in AD → Reaktivierung, Retention-Countdown zurücksetzen
          user.IsActive = true;
          user.DeactivatedAt = null;
          reactivated++;
          changed = true;
        }

        if (changed)
        {
          user.UpdatedAt = now;
          updated++;
        }
      }
      else
      {
        // ── Neuer User ──
        // Edge-Case wie im Auto-Provisioning (MeController): gleiche E-Mail
        // mit anderem oid würde den Unique-Constraint verletzen.
        if (dbUsers.Any(x => x.Email == email))
        {
          _logger.LogWarning("AD-Sync: {Email} übersprungen — E-Mail existiert bereits mit anderem oid", email);
          skipped++;
          continue;
        }

        var newUser = new User
        {
          Id                  = Guid.NewGuid(),
          AdObjectId          = gu.Id,
          Email               = email,
          DisplayName         = gu.DisplayName!,
          FirstName           = gu.GivenName,
          LastName            = gu.Surname,
          DepartmentId        = deptId,
          Role                = role,
          IsDepartmentManager = isManager,
          IsActive            = true,
          CreatedAt           = now,
          UpdatedAt           = now
        };

        _db.Users.Add(newUser);
        dbUsers.Add(newUser); // damit der E-Mail-Duplikat-Check im selben Lauf greift
        created++;
      }
    }

    // ── 4. Fehlende User → inactive (12-Monate-Retention-Countdown) ────
    foreach (var user in dbUsers.Where(u => u.IsActive && !seenOids.Contains(u.AdObjectId)))
    {
      user.IsActive = false;
      user.DeactivatedAt = now;
      user.UpdatedAt = now;
      deactivated++;
      _logger.LogInformation("AD-Sync: {Email} deaktiviert (nicht mehr in G_FeedbackHub / in AD deaktiviert)", user.Email);
    }

    // ── 5. Lockout-Schutz ───────────────────────────────────────────────
    // Bliebe kein aktiver Admin übrig (z. B. G_FeedbackHub_Admin leer oder
    // falsch konfiguriert), wird der GESAMTE Lauf verworfen.
    var anyActiveAdmin = _db.Users.Local.Any(u => u.IsActive && u.Role == "admin");
    if (!anyActiveAdmin)
    {
      _db.ChangeTracker.Clear();
      return Fail("lockout_protection — Sync hätte keinen aktiven Admin übrig gelassen. " +
                  "Prüfe die Mitglieder von G_FeedbackHub_Admin (müssen auch in G_FeedbackHub sein).");
    }

    // ── 6. Speichern ────────────────────────────────────────────────────
    try
    {
      await _db.SaveChangesAsync(ct);
    }
    catch (DbUpdateException ex)
    {
      _db.ChangeTracker.Clear();
      return Fail($"db_error: {ex.InnerException?.Message ?? ex.Message}");
    }

    var result = new AdSyncResult(true, null, created, updated, reactivated, deactivated, skipped, startedAt, DateTime.UtcNow);
    _logger.LogInformation(
      "AD-Sync erfolgreich: {Created} neu, {Updated} aktualisiert, {Reactivated} reaktiviert, {Deactivated} deaktiviert, {Skipped} übersprungen",
      created, updated, reactivated, deactivated, skipped);
    return result;
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  /// <summary>
  /// Lädt alle Mitglieder einer Gruppe, die vom Typ "user" sind
  /// (Filter "objectClass = user" der Spezifikation — Graph erledigt das
  /// über das GraphUser-Cast, Gruppen/Geräte fallen automatisch raus).
  /// Mit Paging, falls die Gruppe > 999 Mitglieder hat.
  /// </summary>
  private static async Task<List<GraphUser>> GetGroupUsersAsync(
    GraphServiceClient graph, string groupId, CancellationToken ct)
  {
    var result = new List<GraphUser>();

    var page = await graph.Groups[groupId].Members.GraphUser.GetAsync(rc =>
    {
      rc.QueryParameters.Select = new[]
      {
        "id", "displayName", "givenName", "surname",
        "mail", "userPrincipalName", "department", "accountEnabled"
      };
      rc.QueryParameters.Top = 999;
    }, ct);

    while (page != null)
    {
      if (page.Value != null) result.AddRange(page.Value);
      if (string.IsNullOrEmpty(page.OdataNextLink)) break;

      page = await graph.Groups[groupId].Members.GraphUser
        .WithUrl(page.OdataNextLink)
        .GetAsync(cancellationToken: ct);
    }

    return result;
  }

  /// <summary>
  /// Mappt das AD-Attribut "department" auf departments.id —
  /// unbekannte Departments werden automatisch angelegt.
  /// </summary>
  private async Task<Guid?> ResolveDepartmentAsync(string? name, DateTime now, CancellationToken ct)
  {
    if (string.IsNullOrWhiteSpace(name)) return null;
    name = name.Trim();

    if (_deptCache.TryGetValue(name, out var cachedId)) return cachedId;

    var dept = await _db.Departments
      .FirstOrDefaultAsync(d => d.Name.ToLower() == name.ToLower(), ct);

    if (dept == null)
    {
      dept = new Department { Id = Guid.NewGuid(), Name = name, CreatedAt = now };
      _db.Departments.Add(dept);
      _logger.LogInformation("AD-Sync: neues Department \"{Name}\" angelegt", name);
    }

    _deptCache[name] = dept.Id;
    return dept.Id;
  }
}
