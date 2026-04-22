using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("departments")]
public class Department
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("name")]
  public string Name { get; set; } = null!;

  [Column("manager_user_id")]
  public Guid? ManagerUserId { get; set; }

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }

  // Navigation
  public User? Manager { get; set; }
  public ICollection<User> Users { get; set; } = [];
}
