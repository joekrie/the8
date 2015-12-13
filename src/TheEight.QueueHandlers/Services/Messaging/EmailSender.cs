using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using SendGrid;
using TheEight.Common.Domain.Messaging;

namespace TheEight.QueueHandlers.Services.Messaging
{
    public class EmailSender
    {
        private readonly Web _sendGridClient;

        public EmailSender(Web sendGridClient)
        {
            _sendGridClient = sendGridClient;
        }

        public async Task SendEmailAsync(IEnumerable<MailAddress> recipients, EmailContent emailContent)
        {
            var message = new SendGridMessage
            {
                To = recipients.ToArray(),
                Subject = emailContent.Subject,
                Text = emailContent.Body,
                Html = emailContent.Body
            };

            await _sendGridClient.DeliverAsync(message);
        }
    }
}