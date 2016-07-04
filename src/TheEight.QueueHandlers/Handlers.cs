using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Options;
using TheEight.Options;
using Twilio;

namespace TheEight.QueueHandlers
{
    public class Handlers
    {
        private readonly TwilioOptions _twilioOptions;

        public Handlers(IOptions<TwilioOptions> twilioOptions)
        {
            _twilioOptions = twilioOptions.Value;
        }

        public void ProcessQueueMessage([QueueTrigger("test")] string msg)
        {
            var twilio = new TwilioRestClient(_twilioOptions.AccountSid, _twilioOptions.AuthToken);
            var message = twilio.SendMessage(_twilioOptions.PhoneNumber, "+16123560855", msg);
        }
    }
}
