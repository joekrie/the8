using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using TheEight.Common.Domain.Messaging;

namespace TheEight.QueueHandlers.Handlers.Messaging
{
    public class MessageHandler 
    {
        private readonly EmailSender _emailSender;
        private readonly TextMessageSender _textMessageSender;

        public MessageHandler(EmailSender emailSender, TextMessageSender textMessageSender)
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
