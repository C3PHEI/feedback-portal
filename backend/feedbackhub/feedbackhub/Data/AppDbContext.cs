using Microsoft.EntityFrameworkCore;
using feedbackhub.Models;

namespace feedbackhub.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
  public DbSet<Department> Departments => Set<Department>();
  public DbSet<User> Users => Set<User>();
  public DbSet<Driver> Drivers => Set<Driver>();
  public DbSet<Feedback> Feedbacks => Set<Feedback>();
  public DbSet<Rating> Ratings => Set<Rating>();
  public DbSet<Notification> Notifications => Set<Notification>();
  public DbSet<AnonymousRateLimit> AnonymousRateLimits => Set<AnonymousRateLimit>();
  public DbSet<CocReport> CocReports => Set<CocReport>();
}
