using System.Collections.Generic;

namespace TheEight.Common.Database.Entities.Messaging
{
    public class MessageBatch
    {
        public IEnumerable<string> RecipientIds { get; set; }
        public Message Message { get; set; }
    }
}