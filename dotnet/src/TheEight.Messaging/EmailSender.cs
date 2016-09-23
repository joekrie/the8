using PostmarkDotNet;
using PostmarkDotNet.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TheEight.Options;

namespace TheEight.Messaging
{
    public class EmailSender
    {
        private readonly PostmarkOptions _postmarkOptions;

        public EmailSender(IOptions<PostmarkOptions> postmarkOptions)
        {
            _postmarkOptions = postmarkOptions.Value;
            Console.Write("EmailSender constructor");
        }

        public async Task SendEmail()
        {
            var message = new PostmarkMessage()
            {
                To = "joe.kriefall@gmail.com",
                From = "joe.kriefall@the8.io",
                TrackOpens = true,
                Subject = "A complex email",
                TextBody = "Plain Text Body",
                HtmlBody = "<html><body>Hi</body></html>"
            };
            
            var client = new PostmarkClient(_postmarkOptions.ServerToken);
            var sendResult = await client.SendMessageAsync(message);

            if (sendResult.Status == PostmarkStatus.Success)
            {
                /* Handle success */
            }
            else
            {
                /* Resolve issue.*/
            }
        }
    }
}