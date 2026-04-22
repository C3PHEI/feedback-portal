using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("anonymous_rate_limits")]
public class AnonymousRateLimit
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("submitter_id")]
  public Guid SubmitterId { get; set; }

  [Column("recipient_id")]
  public Guid RecipientId { get; set; }

  [Column("year")]
  public int Year { get; set; }

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }

  // Navigation
  [ForeignKey("SubmitterId")]
  public User Submitter { get; set; } = null!;

  [ForeignKey("RecipientId")]
  public User Recipient { get; set; } = null!;
}
