using System.IO;
using System.Net.Mail;
using Microsoft.Azure.WebJobs;

namespace TheEight.QueueHandlers.Handlers
{
    public class MessageHandler
    {
        private readonly SmtpClient _smtpClient;
        
        public MessageHandler(SmtpClient smtpClient)
        {
            _smtpClient = smtpClient;
        }

        public void SendMessage([QueueTrigger("messages")] string message)
        {
            _smtpClient.Send("joe@the8.io", "joe.kriefall@gmail.com", "Sent by a WebJob!!!", message);
        }
    }
}
