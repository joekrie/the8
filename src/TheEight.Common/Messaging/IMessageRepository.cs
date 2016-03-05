using System.Collections.Generic;

namespace TheEight.Common.Messaging
{
    public interface IMessageRepository
    {
        IEnumerable<Message> GetMessages();
    }
}