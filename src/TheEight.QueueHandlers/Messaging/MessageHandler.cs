using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using TheEight.Common.Messaging;

namespace TheEight.QueueHandlers.Messaging
{
    public class MessageHandler 
    {
        private readonly IEmailService _emailSender;
        private readonly ITextMessageService _textMessageSender;

        public MessageHandler(IEmailService emailSender, ITextMessageService textMessageSender)
        {
            _emailSender = emailSender;
            _textMessageSender = textMessageSender;
        }
        
        public async Task ProcessMessageBatchAsync([QueueTrigger("messages")] MessageBatch batch)
        {
            var msg = new EmailContent
            {
                Subject = batch.Message.Email.Subject,
                Body = batch.Message.Email.Body
            };

            await _textMessageSender.SendTextMessageAsync(new[] {"+16123560855"}, batch.Message.TextMessage);
            await _emailSender.SendEmailAsync(new[] { new MailAddress("joe.kriefall@gmail.com") }, msg);
        }
    }
}
