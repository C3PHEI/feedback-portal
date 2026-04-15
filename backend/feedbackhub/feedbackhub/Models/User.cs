using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("users")]
public class User
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("ad_object_id")]
  public string AdObjectId { get; set; } = null!;

  [Column("email")]
  public string Email { get; set; } = null!;

  [Column("display_name")]
  public string DisplayName { get; set; } = null!;

  [Column("role")]
  public string Role { get; set; } = "user";

  [Column("is_active")]
  public bool IsActive { get; set; } = true;

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }
}
