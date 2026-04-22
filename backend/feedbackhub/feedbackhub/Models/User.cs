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

  [Column("first_name")]
  public string? FirstName { get; set; }

  [Column("last_name")]
  public string? LastName { get; set; }

  [Column("department_id")]
  public Guid? DepartmentId { get; set; }

  [Column("role")]
  public string Role { get; set; } = "user";

  [Column("is_department_manager")]
  public bool IsDepartmentManager { get; set; } = false;

  [Column("is_active")]
  public bool IsActive { get; set; } = true;

  [Column("deactivated_at")]
  public DateTime? DeactivatedAt { get; set; }

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }

  [Column("updated_at")]
  public DateTime UpdatedAt { get; set; }

  // Navigation
  [ForeignKey("DepartmentId")]
  public Department? Department { get; set; }
}
