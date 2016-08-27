using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Options;
using TheEight.Options;
using TheEight.QueueHandlers.Messages;
using Twilio.Clients;
using Twilio.Creators.Api.V2010.Account;
using Twilio.Types;

namespace TheEight.QueueHandlers.Handlers
{
    public class TextMessageHandler
    {
        private readonly TwilioOptions _twilioOptions;

        public TextMessageHandler(IOptions<TwilioOptions> twilioOptions)
        {
            _twilioOptions = twilioOptions.Value;
        }

        public async Task ProcessQueueMessage([QueueTrigger("text-messages")] TextMessageMsg message)
        {
            var twilioClient = new TwilioRestClient(_twilioOptions.AccountSid, _twilioOptions.AuthToken);

            var request = new MessageCreator(
                _twilioOptions.AccountSid,
                new PhoneNumber(message.Recipient),
                new PhoneNumber(_twilioOptions.PhoneNumber), 
                message.Content);

            var response = await request.ExecuteAsync(twilioClient);
            var errorCode = response.GetErrorCode();

            if (errorCode != null)
            {
                // log error, throw exception
                // will be requeued, ensure that errorCode means wasn't sent
                throw new Exception("Error sending Twilio message");
            }
        }
    }
}
