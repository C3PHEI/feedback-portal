using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("notifications")]
public class Notification
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("feedback_id")]
  public Guid FeedbackId { get; set; }

  [Column("recipient_user_id")]
  public Guid RecipientUserId { get; set; }

  [Column("is_sent")]
  public bool IsSent { get; set; } = false;

  [Column("sent_at")]
  public DateTime? SentAt { get; set; }

  [Column("created_at")]
  public DateTime CreatedAt { get; set; }

  // Navigation
  [ForeignKey("FeedbackId")]
  public Feedback Feedback { get; set; } = null!;

  [ForeignKey("RecipientUserId")]
  public User Recipient { get; set; } = null!;
}
