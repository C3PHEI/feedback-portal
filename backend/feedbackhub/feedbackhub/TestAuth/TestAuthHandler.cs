using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace feedbackhub.TestAuth;

/// <summary>
/// Authentifizierungs-Handler fuer den IPA-Testbetrieb.
///
/// AKTIV NUR WENN:
///   - ASPNETCORE_ENVIRONMENT = Development
///   - UND appsettings.Development.json: "TestAuth:Enabled" = true
///
/// Der Handler liest den Header "X-Test-User" und mappt vordefinierte
/// Test-Identitaeten auf ihre echten ad_object_id-Werte aus dem Seed.
/// Damit kann der IPA-Experte das Backend testen, ohne Microsoft-Login
/// durchzufuehren.
///
/// SICHERHEIT:
///   - Production-Deployment hat diesen Code nicht aktiv (siehe Program.cs)
///   - Auch bei versehentlicher Aktivierung in Prod: Header-Mapping kennt
///     nur die Seed-User-IDs; ohne Eintrag in der Production-DB schlaegt
///     jede Anfrage trotzdem fehl
///   - Erstellt KEIN Auto-Provisioning, kein User-Insert
///
/// Quelle: Bewusste Erweiterung fuer IPA-Testdurchfuehrung
///         (siehe IPA-Doku Kap. 10.4.4)
/// </summary>
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "TestAuth";
    public const string HeaderName = "X-Test-User";

    // Mapping Test-User-Label → ad_object_id aus Seed
    // Diese IDs MUESSEN mit den oid-Werten in feedback_hub_reset_und_seed.sql
    // exakt uebereinstimmen.
    private static readonly Dictionary<string, TestUser> KnownUsers = new()
    {
        ["max"] = new TestUser(
            AdObjectId:  "320a42ff-f04a-46b2-b9c8-12dea5645460",
            Email:       "maximilian.laepple@casinodavos.ch",
            DisplayName: "Maximilian Laepple"
        ),
        ["adma"] = new TestUser(
            AdObjectId:  "b21168e5-a0bf-44d0-adc2-fcede14b1072",
            Email:       "adma.maxl@casinodavos.ch",
            DisplayName: "Maximilian Laepple (ADMA)"
        )
    };

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(HeaderName, out var headerValue))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var label = headerValue.ToString().Trim().ToLowerInvariant();

        if (!KnownUsers.TryGetValue(label, out var user))
        {
            Logger.LogWarning("TestAuth: Unbekannter X-Test-User-Wert: {Label}", label);
            return Task.FromResult(AuthenticateResult.Fail(
                $"Unbekannter Test-User '{label}'. Erlaubt: max, adma"));
        }

        var claims = new List<Claim>
        {
            // 'oid' wird vom MeController + ResolveCurrentUserAsync gelesen
            new("oid", user.AdObjectId),
            new(ClaimTypes.NameIdentifier, user.AdObjectId),
            new("name", user.DisplayName),
            new("preferred_username", user.Email),
            new("email", user.Email),

            // Scope wird von [RequiredScope("access_as_user")] geprueft
            new("http://schemas.microsoft.com/identity/claims/scope", "access_as_user")
        };

        var identity  = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket    = new AuthenticationTicket(principal, SchemeName);

        Logger.LogInformation("TestAuth: Authentifiziert als '{Label}' (oid {Oid})",
            label, user.AdObjectId);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private record TestUser(string AdObjectId, string Email, string DisplayName);
}
