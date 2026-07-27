using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;

namespace feedbackhub.Services;

public class GraphEmailService
{
  private readonly GraphServiceClient _graphClient;

  public GraphEmailService(GraphServiceClient graphClient)
  {
    _graphClient = graphClient;
  }

  // Benachrichtigt den Empfänger, dass er ein neues Feedback erhalten hat.
  // Bewusst ohne Inhalt/Absender – der Empfänger meldet sich für die Details an
  // (wichtig für anonymes Feedback).
  public Task SendFeedbackNotificationAsync(string recipient) =>
    SendEmail(
      recipient,
      "Sie haben neues Feedback erhalten",
      "Guten Tag\n\n" +
      "Sie haben neues Feedback im FeedbackHub erhalten. " +
      "Bitte melden Sie sich im Portal an, um es einzusehen.\n\n" +
      "Freundliche Grüsse\n" +
      "FeedbackHub");

  public async Task SendEmail(string recipient, string subject, string body)
  {
    var message = new Message
    {
      Subject = subject,
      Body = new ItemBody
      {
        ContentType = BodyType.Text,
        Content = body
      },
      ToRecipients = new List<Recipient>
      {
        new Recipient
        {
          EmailAddress = new EmailAddress
          {
            Address = recipient
          }
        }
      }
    };

    var requestBody = new SendMailPostRequestBody
    {
      Message = message,
      SaveToSentItems = true
    };

    await _graphClient
      .Users["FeedbackHub@casinodavos.ch"]
      .SendMail
      .PostAsync(requestBody);
  }
}
