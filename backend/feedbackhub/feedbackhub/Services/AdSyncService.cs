using Azure.Identity;
using feedbackhub.Data;
using feedbackhub.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Microsoft.Graph.Models.ODataErrors;
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
/// Das AD ist Single Source of Truth für Benutzer, Rollen und Team-Zugehörigkeit.
///
/// Regeln:
///   - Scope   = Mitglieder der Gruppe G_FeedbackHub          (AdSync:UserGroupId)
///   - Rolle   = admin    wenn Mitglied in G_FeedbackHub_Admin (AdSync:AdminGroupId)
///             = manager  wenn von ≥1 Hub-Mitglied als Manager referenziert
///                        (AD-Attribut "manager", GET /users/{id}/manager)
///             = user     sonst.  Priorität admin > manager > user.
///     Es gibt KEINE Manager-Gruppe.
///   - is_department_manager = hat ≥1 Direct Report im Hub (= wird referenziert)
///   - manager_user_id       = DB-Id des Managers, aber nur wenn dieser selbst
///                             im Scope (Hub-Mitglied) ist, sonst NULL.
///   - Department = AD-Attribut "department" (auto-create in departments-Tabelle);
///                  ist nur noch Anzeige-Info, nicht mehr Basis der Sichtbarkeit.
///   - Filter: mail (Fallback userPrincipalName) + displayName müssen gesetzt sein.
///   - Fehlende / in AD deaktivierte User → is_active=false, deactivated_at=now.
///   - Sicherungen: leere Scope-Gruppe → Abbruch; bliebe kein aktiver Admin übrig
///     → kompletter Lauf verworfen.
///
/// Reihenfolge: erst alle upserten, DANN manager_user_id auflösen (neue User
/// müssen referenzierbar sein), dann Deaktivierung, dann Lockout-Check, dann
/// EIN SaveChanges.
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
    var tenantId     = _config["AdSync:TenantId"] ?? _config["AzureAd:TenantId"];
    var clientId     = _config["AdSync:ClientId"] ?? _config["AzureAd:ClientId"];
    var clientSecret = _config["AdSync:ClientSecret"];
    var userGroupId  = _config["AdSync:UserGroupId"];
    var adminGroupId = _config["AdSync:AdminGroupId"];

    if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId) ||
        string.IsNullOrWhiteSpace(clientSecret) || string.IsNullOrWhiteSpace(userGroupId) ||
        string.IsNullOrWhiteSpace(adminGroupId))
      return Fail("missing_configuration (AdSync:ClientSecret / UserGroupId / AdminGroupId)");

    // ── 2. Graph-Client (Client-Credentials-Flow, App-Identität) ───────
    var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    var graph = new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });

    List<GraphUser> adUsers;
    HashSet<string> adminOids;
    try
    {
      adUsers   = await GetGroupUsersAsync(graph, userGroupId, ct);
      adminOids = (await GetGroupUsersAsync(graph, adminGroupId, ct))
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

    // ── 3. Filter: gültige, in AD aktive User-Objekte ──────────────────
    // (schliesst Bot-/Ressourcen-Konten wie Drucker ohne mail/displayName aus)
    var processable = new List<GraphUser>();
    foreach (var gu in adUsers)
    {
      if (string.IsNullOrWhiteSpace(gu.Id)) { skipped++; continue; }

      var email = gu.Mail ?? gu.UserPrincipalName;
      if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(gu.DisplayName))
      {
        _logger.LogWarning("AD-Sync: Konto {Oid} übersprungen (mail/displayName fehlt)", gu.Id);
        skipped++;
        continue;
      }

      // In AD deaktivierte Konten NICHT verarbeiten → werden in Schritt 7 wie
      // "fehlend" behandelt (inactive + Retention-Countdown).
      if (gu.AccountEnabled == false) { skipped++; continue; }

      processable.Add(gu);
    }

    // ── 4. Manager-Beziehungen laden ───────────────────────────────────
    // Pro Hub-Mitglied den Manager auflösen (GET /users/{id}/manager, 404 = keiner).
    //   managerOfOid[reportOid] = managerOid
    var managerOfOid = new Dictionary<string, string>();
    foreach (var gu in processable)
    {
      var mgrOid = await GetManagerOidAsync(graph, gu.Id!, ct);
      if (!string.IsNullOrWhiteSpace(mgrOid)) managerOfOid[gu.Id!] = mgrOid!;
    }
    // Wer von ≥1 Hub-Mitglied als Manager referenziert wird → Manager-Rolle +
    // is_department_manager (sofern selbst Hub-Mitglied und kein Admin).
    var referencedManagerOids = managerOfOid.Values.ToHashSet();

    // ── 5. Upsert: Neue anlegen / Bestehende aktualisieren ─────────────
    var dbUsers  = await _db.Users.ToListAsync(ct);
    var byOid    = dbUsers.ToDictionary(u => u.AdObjectId);
    var now      = DateTime.UtcNow;
    var seenOids = new HashSet<string>();

    foreach (var gu in processable)
    {
      var email = gu.Mail ?? gu.UserPrincipalName;   // bereits validiert

      var role = adminOids.Contains(gu.Id!)             ? "admin"
               : referencedManagerOids.Contains(gu.Id!) ? "manager"
               : "user";
      var isManager = referencedManagerOids.Contains(gu.Id!);
      var deptId    = await ResolveDepartmentAsync(gu.Department, now, ct);

      if (byOid.TryGetValue(gu.Id!, out var user))
      {
        // ── Bestehender User: Attribute aus AD überschreiben ──
        var changed = false;

        if (user.DisplayName != gu.DisplayName)      { user.DisplayName = gu.DisplayName!;      changed = true; }
        if (user.Email != email)                     { user.Email = email!;                     changed = true; }
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

        seenOids.Add(gu.Id!);
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
          continue;   // NICHT als gesehen markieren
        }

        var newUser = new User
        {
          Id                  = Guid.NewGuid(),
          AdObjectId          = gu.Id!,
          Email               = email!,
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
        dbUsers.Add(newUser);       // damit E-Mail-Duplikat-Check im selben Lauf greift
        byOid[gu.Id!] = newUser;    // damit die Manager-Auflösung neue User findet
        seenOids.Add(gu.Id!);
        created++;
      }
    }

    // ── 6. manager_user_id auflösen (jetzt existieren alle User) ───────
    // Nur setzen, wenn der Manager selbst im Scope (seen) ist, sonst NULL.
    foreach (var oid in seenOids)
    {
      if (!byOid.TryGetValue(oid, out var user)) continue;

      Guid? managerId = null;
      if (managerOfOid.TryGetValue(oid, out var mgrOid) &&
          seenOids.Contains(mgrOid) &&
          byOid.TryGetValue(mgrOid, out var mgr))
      {
        managerId = mgr.Id;
      }

      if (user.ManagerUserId != managerId)
        user.ManagerUserId = managerId;
    }

    // ── 7. Fehlende User → inactive (12-Monate-Retention-Countdown) ────
    foreach (var user in dbUsers.Where(u => u.IsActive && !seenOids.Contains(u.AdObjectId)))
    {
      user.IsActive = false;
      user.DeactivatedAt = now;
      user.UpdatedAt = now;
      deactivated++;
      _logger.LogInformation("AD-Sync: {Email} deaktiviert (nicht mehr in G_FeedbackHub / in AD deaktiviert)", user.Email);
    }

    // ── 8. Lockout-Schutz ───────────────────────────────────────────────
    // Bliebe kein aktiver Admin übrig (z. B. G_FeedbackHub_Admin leer oder
    // falsch konfiguriert), wird der GESAMTE Lauf verworfen.
    var anyActiveAdmin = dbUsers.Any(u => u.IsActive && u.Role == "admin");
    if (!anyActiveAdmin)
    {
      _db.ChangeTracker.Clear();
      return Fail("lockout_protection — Sync hätte keinen aktiven Admin übrig gelassen. " +
                  "Prüfe die Mitglieder von G_FeedbackHub_Admin (müssen auch in G_FeedbackHub sein).");
    }

    // ── 9. Speichern ────────────────────────────────────────────────────
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
  /// Lädt alle Mitglieder einer Gruppe, die vom Typ "user" sind.
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
  /// Liefert die Objekt-ID des Managers eines Users (AD-Attribut "manager")
  /// oder null, wenn kein Manager gesetzt ist (Graph antwortet dann mit 404).
  /// Andere Fehler werden geloggt und als "kein Manager" behandelt, damit ein
  /// einzelner Lesefehler den Gesamt-Sync nicht abbricht.
  /// </summary>
  private async Task<string?> GetManagerOidAsync(
    GraphServiceClient graph, string userId, CancellationToken ct)
  {
    try
    {
      var manager = await graph.Users[userId].Manager.GetAsync(cancellationToken: ct);
      return manager?.Id;
    }
    catch (ODataError ex) when (ex.ResponseStatusCode == 404)
    {
      return null; // kein Manager gesetzt
    }
    catch (Exception ex)
    {
      _logger.LogWarning("AD-Sync: Manager für {Oid} konnte nicht gelesen werden: {Message}", userId, ex.Message);
      return null;
    }
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
