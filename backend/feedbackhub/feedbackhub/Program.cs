using Microsoft.Identity.Web;
using Microsoft.EntityFrameworkCore;
using feedbackhub;
using feedbackhub.Data;

var builder = WebApplication.CreateBuilder(args);

// ── Auth ─────────────────────────────────────────────────
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration);

// ── CORS (für Frontend) ───────────────────────────────────
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

var app = builder.Build();

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
