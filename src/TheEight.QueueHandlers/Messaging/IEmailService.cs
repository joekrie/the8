using System.Collections.Generic;
using System.Net.Mail;
using System.Threading.Tasks;
using TheEight.Common.Messaging;

namespace TheEight.QueueHandlers.Messaging
{
    public interface IEmailService
    {
        Task SendEmailAsync(IEnumerable<MailAddress> recipients, EmailContent emailContent);
    }
}