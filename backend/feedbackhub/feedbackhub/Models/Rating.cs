using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace feedbackhub.Models;

[Table("ratings")]
public class Rating
{
  [Key]
  [Column("id")]
  public Guid Id { get; set; }

  [Column("feedback_id")]
  public Guid FeedbackId { get; set; }

  [Column("driver_id")]
  public Guid DriverId { get; set; }

  [Column("score")]
  public int? Score { get; set; }

  [Column("is_na")]
  public bool IsNa { get; set; } = false;

  // Navigation
  [ForeignKey("FeedbackId")]
  public Feedback Feedback { get; set; } = null!;

  [ForeignKey("DriverId")]
  public Driver Driver { get; set; } = null!;
}
