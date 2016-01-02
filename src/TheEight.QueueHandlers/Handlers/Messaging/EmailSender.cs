using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using SendGrid;
using TheEight.Common.Configuration;
using TheEight.Common.Domain.Messaging;

namespace TheEight.QueueHandlers.Handlers.Messaging
{
    public class EmailSender
    {
        private readonly Web _sendGridClient;
        private readonly string _domain;

        public EmailSender(IOptions<SendGridSettings> sendGridOptions)
        {
            var apiKey = sendGridOptions.Value.ApiKey;
            _sendGridClient = new Web(apiKey);

            _domain = sendGridOptions.Value.Domain;
        }

        public async Task SendEmailAsync(IEnumerable<MailAddress> recipients, EmailContent emailContent)
        {
            var message = new SendGridMessage
            {
                To = recipients.ToArray(),
                From = new MailAddress($"alerts@{_domain}"),
                Subject = emailContent.Subject,
                Text = emailContent.Body,
                Html = emailContent.Body
            };

            await _sendGridClient.DeliverAsync(message);
        }
    }
}