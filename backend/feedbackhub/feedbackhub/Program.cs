using Microsoft.Identity.Web;
using Microsoft.EntityFrameworkCore;
using feedbackhub.Data;
using Scalar.AspNetCore;

//Loads automatically development appsettings
Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
var builder = WebApplication.CreateBuilder(args);

// ── CORS ─────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
  options.AddPolicy("FrontendPolicy", policy =>
  {
    policy.WithOrigins("http://localhost:5500")
      .AllowAnyHeader()
      .AllowAnyMethod();
  });
});

// ── DB ───────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

// ── OpenAPI ──────────────────────────────────────────────
builder.Services.AddOpenApi();

var app = builder.Build();

// ── Scalar ─────────────────────────────
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();            // generiert /openapi/v1.json
  app.MapScalarApiReference(options =>
  {
    options.Title = "Feedback Hub API";
    options.Theme = ScalarTheme.Solarized;
  });
}

app.UseCors("FrontendPolicy");
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();
app.Run();
