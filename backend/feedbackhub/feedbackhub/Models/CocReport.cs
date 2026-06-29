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

  [Column("action_taken")]
  public string? ActionTaken { get; set; }

  [Column("action_reason")]
  public string? ActionReason { get; set; }

  [Column("action_notes")]
  public string? ActionNotes { get; set; }

  [Column("hr_intervention")]
  public bool? HrIntervention { get; set; }

  [Column("hr_escalation")]
  public bool? HrEscalation { get; set; }

  [Column("resolved_by")]
  public Guid? ResolvedBy { get; set; }

  // Navigation
  [ForeignKey("FeedbackId")]
  public Feedback Feedback { get; set; } = null!;

  [ForeignKey("ReporterUserId")]
  public User Reporter { get; set; } = null!;
}
