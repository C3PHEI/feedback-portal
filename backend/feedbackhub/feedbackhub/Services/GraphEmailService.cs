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

  public async Task SendEmail(string recipient)
  {
    var message = new Message
    {
      Subject = "FeedbackHub test notification",
      Body = new ItemBody
      {
        ContentType = BodyType.Text,
        Content = "This is a test email from FeedbackHub."
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
