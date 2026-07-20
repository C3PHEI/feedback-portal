namespace feedbackhub.Services;

/// <summary>
/// Hält das Ergebnis des letzten Sync-Laufs im Speicher (Singleton) —
/// wird vom manuellen Endpoint und später von /api/admin/system-status gelesen.
/// </summary>
public class AdSyncStatusStore
{
  private readonly object _lock = new();
  private AdSyncResult? _lastResult;

  // Ringpuffer der letzten Läufe (neuester zuerst), im RAM.
  // Geht bei App-Neustart verloren — für einen dauerhaften Audit-Verlauf
  // müsste er in die DB persistiert werden.
  private const int MaxHistory = 20;
  private readonly LinkedList<AdSyncResult> _history = new();

  public AdSyncResult? LastResult
  {
    get { lock (_lock) return _lastResult; }
    set { lock (_lock) _lastResult = value; }
  }

  /// <summary>
  /// Legt ein Sync-Ergebnis als letzten Lauf ab und hängt es an den Verlauf an.
  /// </summary>
  public void Add(AdSyncResult result)
  {
    lock (_lock)
    {
      _lastResult = result;
      _history.AddFirst(result);
      while (_history.Count > MaxHistory) _history.RemoveLast();
    }
  }

  /// <summary>Die letzten Läufe, neuester zuerst (Kopie).</summary>
  public IReadOnlyList<AdSyncResult> History
  {
    get { lock (_lock) return _history.ToList(); }
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

    var runAtHour    = _config.GetValue<int?>("AdSync:RunAtHour") ?? 3;
    var runOnStartup = _config.GetValue<bool?>("AdSync:RunOnStartup") ?? true;

    // Initialer Lauf kurz nach dem Start. Ohne diesen würde die Liste nach
    // jedem (Neu-)Start / App-Pool-Recycle erst beim nächsten geplanten
    // Zeitpunkt aktualisiert. Unter In-Process-Hosting (IIS) kann der Prozess
    // bei Inaktivität beendet werden — dann fällt der geplante 03:00-Lauf aus,
    // wenn nachts kein Request die App am Leben hält. Ein Startup-Lauf sorgt
    // dafür, dass jede Wiederbelebung der App die Liste aktualisiert.
    if (runOnStartup)
    {
      try
      {
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        _logger.LogInformation("AD-Sync: initialer Lauf nach Start.");
        await RunSyncAsync(stoppingToken);
      }
      catch (TaskCanceledException)
      {
        return; // App wird heruntergefahren
      }
    }

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

      await RunSyncAsync(stoppingToken);
    }
  }

  /// <summary>
  /// Führt einen einzelnen Sync-Lauf in eigenem DI-Scope aus und legt das
  /// Ergebnis im StatusStore ab. Fehler werden geloggt, aber nie propagiert —
  /// sonst würde der Background-Loop enden und es gäbe bis zum nächsten
  /// Neustart keinen Sync mehr.
  /// </summary>
  private async Task RunSyncAsync(CancellationToken stoppingToken)
  {
    // AdSyncService ist Scoped (braucht AppDbContext) → eigener Scope pro Lauf
    using var scope = _scopeFactory.CreateScope();
    var syncService = scope.ServiceProvider.GetRequiredService<AdSyncService>();

    try
    {
      var result = await syncService.RunAsync(stoppingToken);
      _status.Add(result);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "AD-Sync: unerwarteter Fehler im Background-Lauf");
      var now = DateTime.UtcNow;
      _status.Add(new AdSyncResult(false, ex.Message, 0, 0, 0, 0, 0, now, now));
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
