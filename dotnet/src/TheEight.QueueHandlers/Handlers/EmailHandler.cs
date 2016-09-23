using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Options;
using RestSharp;
using RestSharp.Authenticators;
using TheEight.Options;
using TheEight.QueueHandlers.Messages;
using TheEight.Messaging;

namespace TheEight.QueueHandlers.Handlers
{
    public class EmailHandler
    {
        private readonly EmailSender _emailSender;

        public EmailHandler(EmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public async Task ProcessQueueMessage([QueueTrigger("emails")] EmailMsg message)
        {
            await _emailSender.SendEmail();
        }
    }
}
