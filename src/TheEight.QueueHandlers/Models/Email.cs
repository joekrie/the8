using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TheEight.QueueHandlers.Models
{
    public class Email
    {
        public string Recipient { get; set; }
        public string Sender { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
}
