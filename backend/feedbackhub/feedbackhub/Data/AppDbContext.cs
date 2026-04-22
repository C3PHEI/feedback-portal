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

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<Department>()
      .HasOne(d => d.Manager)
      .WithMany()
      .HasForeignKey(d => d.ManagerUserId)
      .OnDelete(DeleteBehavior.SetNull);

    modelBuilder.Entity<User>()
      .HasOne(u => u.Department)
      .WithMany(d => d.Users)
      .HasForeignKey(u => u.DepartmentId)
      .OnDelete(DeleteBehavior.SetNull);
  }
}
