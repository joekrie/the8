using System.Collections.Generic;
using System.Linq;

namespace TheEight.QueueHandlers.Messages
{
    public class EmailMsg
    {
        public string SenderEmailAddress { get; set; }
        public IEnumerable<string> RecipientEmailAddresses { get; set; }
        public string Header { get; set; }
        public string Body { get; set; }

        public string RecipientEmailAddressesCommaSeperated => string.Join(",", RecipientEmailAddresses);
    }
}