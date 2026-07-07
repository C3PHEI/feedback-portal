namespace feedbackhub.Services;

/// <summary>
/// Hält das Ergebnis des letzten Sync-Laufs im Speicher (Singleton) —
/// wird vom manuellen Endpoint und später von /api/admin/system-status gelesen.
/// </summary>
public class AdSyncStatusStore
{
  private readonly object _lock = new();
  private AdSyncResult? _lastResult;

  public AdSyncResult? LastResult
  {
    get { lock (_lock) return _lastResult; }
    set { lock (_lock) _lastResult = value; }
  }
}

/// <summary>
/// Täglicher Trigger für den AD-Sync.
/// Läuft einmal pro Tag um AdSync:RunAtHour (Server-Lokalzeit, Standard 03:00).
/// Deaktivierbar über AdSync:Enabled=false (z. B. lokal in Development,
/// solange kein Client Secret vorhanden ist).
/// </summary>
public class AdSyncBackgroundService : BackgroundService
{
  private readonly IServiceScopeFactory _scopeFactory;
  private readonly IConfiguration _config;
  private readonly ILogger<AdSyncBackgroundService> _logger;
  private readonly AdSyncStatusStore _status;

  public AdSyncBackgroundService(
    IServiceScopeFactory scopeFactory,
    IConfiguration config,
    ILogger<AdSyncBackgroundService> logger,
    AdSyncStatusStore status)
  {
    _scopeFactory = scopeFactory;
    _config = config;
    _logger = logger;
    _status = status;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    if (!_config.GetValue<bool>("AdSync:Enabled"))
    {
      _logger.LogInformation("AD-Sync deaktiviert (AdSync:Enabled=false) — Background-Job startet nicht.");
      return;
    }

    var runAtHour = _config.GetValue<int?>("AdSync:RunAtHour") ?? 3;

    while (!stoppingToken.IsCancellationRequested)
    {
      var delay = GetDelayUntilNextRun(runAtHour);
      _logger.LogInformation("Nächster AD-Sync um {Time} (in {Delay})",
        DateTime.Now.Add(delay).ToString("dd.MM.yyyy HH:mm"), delay);

      try
      {
        await Task.Delay(delay, stoppingToken);
      }
      catch (TaskCanceledException)
      {
        break; // App wird heruntergefahren
      }

      // AdSyncService ist Scoped (braucht AppDbContext) → eigener Scope pro Lauf
      using var scope = _scopeFactory.CreateScope();
      var syncService = scope.ServiceProvider.GetRequiredService<AdSyncService>();

      try
      {
        var result = await syncService.RunAsync(stoppingToken);
        _status.LastResult = result;
      }
      catch (Exception ex)
      {
        // Fehler dürfen den Background-Loop nie beenden —
        // sonst gäbe es bis zum nächsten Neustart keinen Sync mehr.
        _logger.LogError(ex, "AD-Sync: unerwarteter Fehler im Background-Lauf");
        var now = DateTime.UtcNow;
        _status.LastResult = new AdSyncResult(false, ex.Message, 0, 0, 0, 0, 0, now, now);
      }
    }
  }

  /// <summary>
  /// Berechnet die Wartezeit bis zur nächsten Ausführung (heute oder morgen
  /// um {hour}:00 Server-Lokalzeit).
  /// </summary>
  private static TimeSpan GetDelayUntilNextRun(int hour)
  {
    var now = DateTime.Now;
    var next = now.Date.AddHours(hour);
    if (next <= now) next = next.AddDays(1);
    return next - now;
  }
}
