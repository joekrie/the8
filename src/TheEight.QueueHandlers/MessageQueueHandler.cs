using System.Net.Mail;
using Microsoft.Azure.WebJobs;

namespace TheEight.QueueHandlers
{
    public class MessageQueueHandler
    {
        private readonly SmtpClient _smtpClient;

        public MessageQueueHandler(SmtpClient smtpClient)
        {
            _smtpClient = smtpClient;
        }

        public void SendMessage([QueueTrigger("messages")] string message)
        {
            _smtpClient.Send("joe@the8.io", "joe.kriefall@gmail.com", "Sent by a WebJob!!!", message);
        }
    }
}