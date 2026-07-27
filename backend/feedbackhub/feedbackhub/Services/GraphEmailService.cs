using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;

namespace feedbackhub.Services;

public class GraphEmailService
{
    private readonly GraphServiceClient _graphClient;
    private readonly ILogger<GraphEmailService> _logger;
    private readonly string _portalUrl;
    private readonly string _senderMailbox;

    // Logo einmalig laden und im Speicher halten (statt bei jeder Mail von Disk)
    private static readonly Lazy<byte[]?> LogoBytes = new(() =>
    {
      var path = Path.Combine(AppContext.BaseDirectory, "Assets", "logo.png");
      return File.Exists(path) ? File.ReadAllBytes(path) : null;
    });

    private const string LogoContentId = "fh-logo";

    public GraphEmailService(
        GraphServiceClient graphClient,
        IConfiguration config,
        ILogger<GraphEmailService> logger)
    {
        _graphClient   = graphClient;
        _logger        = logger;
        _portalUrl     = config["App:PortalUrl"]!;
        _senderMailbox = config["App:SenderMailbox"]!;
    }

    // Benachrichtigt den Empfänger, dass er neues Feedback erhalten hat.
    // Portal an, um die Details zu sehen (Schutz anonymer Einreichungen).
    public Task SendFeedbackNotificationAsync(string recipient) =>
        SendHtmlEmailAsync(
            recipient,
            "Sie haben neues Feedback erhalten | You have received new feedback",
            BuildFeedbackNotificationHtml());

    public async Task SendHtmlEmailAsync(
        string recipient,
        string subject,
        string html,
        Importance importance = Importance.Normal)
    {
        var message = new Message
        {
            Subject    = subject,
            Importance = importance,
            Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content     = html
            },
            ToRecipients = new List<Recipient>
            {
                new() { EmailAddress = new EmailAddress { Address = recipient } }
            }
        };

        // Logo inline anhängen – fehlt die Datei, greift der alt-Text im <img>
        // und die Mail geht trotzdem raus.
        if (LogoBytes.Value is { } logo)
        {
            message.Attachments = new List<Attachment>
            {
                new FileAttachment
                {
                    OdataType    = "#microsoft.graph.fileAttachment",
                    Name         = "logo.png",
                    ContentType  = "image/png",
                    ContentId    = LogoContentId,
                    IsInline     = true,
                    ContentBytes = logo
                }
            };
        }
        else
        {
          _logger.LogWarning("Assets/logo.png nicht gefunden – Mail wird ohne Logo versendet.");
        }

        await _graphClient
            .Users[_senderMailbox]
            .SendMail
            .PostAsync(new SendMailPostRequestBody
            {
                Message         = message,
                SaveToSentItems = true
            });
    }

    // Plain-Text-Variante für einfache Systemmails
    public async Task SendEmail(string recipient, string subject, string body)
    {
        await _graphClient
            .Users[_senderMailbox]
            .SendMail
            .PostAsync(new SendMailPostRequestBody
            {
                Message = new Message
                {
                    Subject = subject,
                    Body    = new ItemBody { ContentType = BodyType.Text, Content = body },
                    ToRecipients = new List<Recipient>
                    {
                        new() { EmailAddress = new EmailAddress { Address = recipient } }
                    }
                },
                SaveToSentItems = true
            });
    }

// Tabellenbasiert mit Inline-Styles, da Outlook weder Flexbox noch
    // <style>-Blöcke zuverlässig unterstützt.
    private string BuildFeedbackNotificationHtml()
    {
        const string font = "Arial, Helvetica, sans-serif";

        return $"""
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FeedbackHub</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4;">

  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    Neues Feedback im FeedbackHub
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:30px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff; border:1px solid #e2e2e2;">

          <tr>
            <td style="padding:28px 40px 24px 40px; border-bottom:1px solid #e2e2e2;">
              <a href="{_portalUrl}" target="_blank" style="text-decoration:none; border:0; display:inline-block;">
                <img src="cid:{LogoContentId}" alt="Casino Davos &ndash; FeedbackHub" width="150"
                     style="width:150px; max-width:150px; height:auto; display:block; border:0; outline:none; text-decoration:none;">
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0; font-family:{font}; font-size:15px; line-height:1.6; color:#333333;">
                Guten Tag
              </p>
              <p style="margin:0 0 16px 0; font-family:{font}; font-size:15px; line-height:1.6; color:#333333;">
                Sie haben neues Feedback im FeedbackHub erhalten. Bitte melden Sie sich im
                <a href="{_portalUrl}" target="_blank" style="color:#c8201a; text-decoration:underline;">Portal</a>
                an, um es einzusehen.
              </p>
              <p style="margin:0; font-family:{font}; font-size:15px; line-height:1.6; color:#333333;">
                Freundliche Gr&uuml;sse<br>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td height="1" bgcolor="#e2e2e2" style="height:1px; line-height:1px; font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0; font-family:{font}; font-size:15px; line-height:1.6; color:#333333;">
                Hello
              </p>
              <p style="margin:0 0 16px 0; font-family:{font}; font-size:15px; line-height:1.6; color:#333333;">
                You have received new feedback in FeedbackHub. Please sign in to the
                <a href="{_portalUrl}" target="_blank" style="color:#c8201a; text-decoration:underline;">portal</a>
                to view it.
              </p>
              <p style="margin:0; font-family:{font}; font-size:15px; line-height:1.6; color:#333333;">
                Kind regards<br>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 40px; background-color:#fafafa; border-top:1px solid #e2e2e2;">
              <p style="margin:0; font-family:{font}; font-size:12px; line-height:1.5; color:#888888;">
                Automatisch versendete Nachricht &ndash; bitte nicht antworten.<br>
                Automated message &ndash; please do not reply.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
""";
    }
}
