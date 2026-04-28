using Microsoft.Identity.Web;
using Microsoft.EntityFrameworkCore;
using feedbackhub.Data;
using feedbackhub.Services;
using Scalar.AspNetCore;
using feedbackhub.TestAuth;
using Microsoft.AspNetCore.Authentication;

Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
var builder = WebApplication.CreateBuilder(args);

// ── Auth (Entra ID / JWT + optional Test-Auth fuer IPA) ────────────────────
var testAuthEnabled =
  builder.Environment.IsDevelopment() &&
  builder.Configuration.GetValue<bool>("TestAuth:Enabled");

if (testAuthEnabled)
{
  // Test-Auth ist Default-Schema, JWT bleibt als Fallback
  builder.Services
    .AddAuthentication(options =>
    {
      options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
      options.DefaultChallengeScheme    = TestAuthHandler.SchemeName;
    })
    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
      TestAuthHandler.SchemeName, _ => { })
    .AddMicrosoftIdentityWebApi(builder.Configuration);

  // Beim Start ein deutliches Logging — damit man im Konsolen-Output
  // sofort sieht, dass Test-Auth aktiv ist (und in Prod NIE auftauchen darf)
  Console.WriteLine("");
  Console.WriteLine("⚠️  ════════════════════════════════════════════════");
  Console.WriteLine("⚠️   TEST-AUTH AKTIV — NUR FUER IPA-TESTBETRIEB!");
  Console.WriteLine("⚠️   Authentifizierung via X-Test-User Header");
  Console.WriteLine("⚠️   Erlaubte Werte: max, adma");
  Console.WriteLine("⚠️  ════════════════════════════════════════════════");
  Console.WriteLine("");
}
else
{
  // Production-Pfad — wie bisher
  builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration);
}

// ── CORS ─────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
  options.AddPolicy("FrontendPolicy", policy =>
  {
    policy.WithOrigins("http://localhost:5000")
      .AllowAnyHeader()
      .AllowAnyMethod();
  });
});

// ── DB ───────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Services ─────────────────────────────────────────────
builder.Services.AddScoped<FeedbackService>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<CurrentUserService>();
builder.Services.AddScoped<AdminDashboardService>();
builder.Services.AddScoped<AdminUserService>();
builder.Services.AddScoped<AdminModerationService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.Urls.Add("http://localhost:5185");

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.MapScalarApiReference(options =>
  {
    options.Title = "Feedback Hub API";
    options.Theme = ScalarTheme.Solarized;
  });
}

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
