using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("coc_reports")]
public class CocReport
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("feedback_id")]
  public Guid FeedbackId { get; set; }

  [Column("reporter_user_id")]
  public Guid ReporterUserId { get; set; }

  [Column("reason")]
  public string Reason { get; set; } = null!;

  [Column("status")]
  public string Status { get; set; } = "open";

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }

  [Column("resolved_at")]
  public DateTime? ResolvedAt { get; set; }

  // Navigation
  [ForeignKey("FeedbackId")]
  public Feedback Feedback { get; set; } = null!;

  [ForeignKey("ReporterUserId")]
  public User Reporter { get; set; } = null!;
}
