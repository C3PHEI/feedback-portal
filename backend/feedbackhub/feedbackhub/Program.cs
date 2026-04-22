using Microsoft.Identity.Web;
using Microsoft.EntityFrameworkCore;
using feedbackhub.Data;
using Scalar.AspNetCore;

Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
var builder = WebApplication.CreateBuilder(args);

// ── Auth (Entra ID / JWT) ────────────────────────────────
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration);

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

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
