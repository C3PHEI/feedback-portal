using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("feedback")]
public class Feedback
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("submitter_id")]
  public Guid SubmitterId { get; set; }

  [Column("recipient_id")]
  public Guid RecipientId { get; set; }

  [Column("is_anonymous")]
  public bool IsAnonymous { get; set; } = false;

  [Column("is_edited")]
  public bool IsEdited { get; set; } = false;

  [Column("is_legal_hold")]
  public bool IsLegalHold { get; set; } = false;

  [Column("is_deleted")]
  public bool IsDeleted { get; set; } = false;

  [Column("strengths")]
  public string? Strengths { get; set; }

  [Column("areas_to_improve")]
  public string? AreasToImprove { get; set; }

  [Column("submitted_date")]
  public DateOnly SubmittedDate { get; set; }

  [Column("submitted_at")]
  public DateTime SubmittedAt { get; set; }

  // Navigation
  [ForeignKey("SubmitterId")]
  public User Submitter { get; set; } = null!;

  [ForeignKey("RecipientId")]
  public User Recipient { get; set; } = null!;

  public ICollection<Rating> Ratings { get; set; } = [];
}
