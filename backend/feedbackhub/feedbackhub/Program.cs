using Microsoft.Identity.Web;
using Microsoft.EntityFrameworkCore;
using feedbackhub.Data;
using feedbackhub.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Wichtig: KEIN app.Urls.Add(...) mehr.
// Die URL kommt aus Umgebungsvariable ASPNETCORE_URLS (in Docker: http://+:8080).

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
