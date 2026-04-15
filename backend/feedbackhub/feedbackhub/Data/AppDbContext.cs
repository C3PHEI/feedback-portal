using Microsoft.EntityFrameworkCore;
using feedbackhub.Models;

namespace feedbackhub.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

  public DbSet<User> Users => Set<User>();
  // später: Feedback, Ratings, etc.
}
