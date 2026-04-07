using Microsoft.EntityFrameworkCore;

namespace feedbackhub
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
  }
}
