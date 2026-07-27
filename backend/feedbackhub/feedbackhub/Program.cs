using Microsoft.Identity.Web;
using Microsoft.EntityFrameworkCore;
using feedbackhub.Data;
using feedbackhub.Services;
using Scalar.AspNetCore;
using System.Security.Cryptography.X509Certificates;
using Azure.Identity;
using Microsoft.Graph;

var builder = WebApplication.CreateBuilder(args);

// ── Graph ────────────────────────────────
var graphSettings = builder.Configuration.GetSection("Graph");

var certificate = new X509Certificate2(
  FindCertificate(graphSettings["CertificateThumbprint"])
);

var credential = new ClientCertificateCredential(
  graphSettings["TenantId"],
  graphSettings["ClientId"],
  certificate
);

// ── Auth (Entra ID / JWT) ────────────────────────────────
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration);

// ── CORS ─────────────────────────────────────────────────
// Erlaubte Origins kommen aus appsettings ("Cors:AllowedOrigins")
var allowedOrigins = builder.Configuration
  .GetSection("Cors:AllowedOrigins")
  .Get<string[]>() ?? new[] { "http://localhost:5000" };

builder.Services.AddCors(options =>
{
  options.AddPolicy("FrontendPolicy", policy =>
  {
    policy.WithOrigins(allowedOrigins)
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
builder.Services.AddScoped<AdSyncService>();
builder.Services.AddSingleton<AdSyncStatusStore>();
builder.Services.AddHostedService<AdSyncBackgroundService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton(new GraphServiceClient(credential));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.MapScalarApiReference(options =>
  {
    options.Title = "Feedback Hub API";
    options.Theme = ScalarTheme.Solarized;
  });
}

// Frontend (gebautes dist/) ausliefern
app.UseDefaultFiles();   // index.html als Default
app.UseStaticFiles();    // statische Dateien aus wwwroot

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// SPA-Fallback: alles was kein /api ist -> index.html
app.MapFallbackToFile("index.html");

app.Run();

static X509Certificate2 FindCertificate(string thumbprint)
{
  using var store = new X509Store(
    StoreName.My,
    StoreLocation.LocalMachine);

  store.Open(OpenFlags.ReadOnly);

  var certificate = store.Certificates
    .Find(
      X509FindType.FindByThumbprint,
      thumbprint,
      validOnly: false)
    .OfType<X509Certificate2>()
    .FirstOrDefault();

  if (certificate == null)
  {
    throw new Exception(
      $"Certificate with thumbprint {thumbprint} not found.");
  }

  return certificate;
}
