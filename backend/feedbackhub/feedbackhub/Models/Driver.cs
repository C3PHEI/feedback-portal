using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("drivers")]
public class Driver
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("name")]
  public string Name { get; set; } = null!;

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }

  // Navigation
  public ICollection<Rating> Ratings { get; set; } = [];
}
