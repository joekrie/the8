using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autofac.Extras.AttributeMetadata;
using Microsoft.Extensions.OptionsModel;
using TheEight.Common.Configuration.Models;
using TheEight.Common.Domain.Messaging;
using Twilio;

namespace TheEight.QueueHandlers.Services.Messaging
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

        public Task SendTextMessageAsync(IEnumerable<string> recipientPhoneNumbers, 
            TextMessageContent textMessageContent)
        {
            foreach (var recipient in recipientPhoneNumbers)
            {
                _twilioClient.SendMessage(_phoneNumber, recipient, textMessageContent.Body);
            }

            return Task.FromResult(0);
        }
    }
}