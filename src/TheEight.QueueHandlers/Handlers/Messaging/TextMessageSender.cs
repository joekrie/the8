using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TheEight.Common.Configuration;
using TheEight.Common.Configuration.Services;
using Twilio;

namespace TheEight.QueueHandlers.Handlers.Messaging
{
    public class TextMessageSender
    {
        private readonly TwilioRestClient _twilioClient;
        private readonly string _phoneNumber;

        public TextMessageSender(IOptions<TwilioSettings> twilioSettings)
        {
            _twilioClient = new TwilioRestClient(twilioSettings.Value.AccountSid, twilioSettings.Value.AuthToken);
            _phoneNumber = twilioSettings.Value.PhoneNumber;
        }

        public Task SendTextMessageAsync(IEnumerable<string> recipientPhoneNumbers, string message)
        {
            foreach (var recipient in recipientPhoneNumbers)
            {
                _twilioClient.SendMessage(_phoneNumber, recipient, message);
            }

            return Task.FromResult(0);
        }
    }
}