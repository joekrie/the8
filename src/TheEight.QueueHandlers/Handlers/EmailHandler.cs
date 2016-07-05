using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Options;
using RestSharp;
using RestSharp.Authenticators;
using TheEight.Options;
using TheEight.QueueHandlers.Messages;

namespace TheEight.QueueHandlers.Handlers
{
    public class EmailHandler
    {
        private readonly MailgunOptions _mailgunOptions;

        public EmailHandler(IOptions<MailgunOptions> mailgunOptions)
        {
            _mailgunOptions = mailgunOptions.Value;
        }

        public async Task ProcessQueueMessage([QueueTrigger("emails")] EmailMsg message)
        {
            var client = new RestClient
            {
                BaseUrl = new Uri(_mailgunOptions.ApiBaseUrl),
                Authenticator = new HttpBasicAuthenticator("api", _mailgunOptions.ApiKey)
            };

            var request = new RestRequest
            {
                Resource = "messages",
                Method = Method.POST
            };

            request.AddParameter("from", message.SenderEmailAddress);
            request.AddParameter("to", message.RecipientEmailAddressesCommaSeperated);
            request.AddParameter("subject", message.Header);
            request.AddParameter("text", message.Body);

            var response = await client.ExecuteTaskAsync(request);

            // how to handle all exceptions?
            if (response.ErrorException != null)
            {
                throw response.ErrorException;
            }
        }
    }
}
