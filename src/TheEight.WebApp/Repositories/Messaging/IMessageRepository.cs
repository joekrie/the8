using System.Collections.Generic;
using TheEight.Common.Domain.Messaging;

namespace TheEight.WebApp.Repositories.Messaging
{
    public interface IMessageRepository
    {
        IEnumerable<Message> GetMessages();
    }
}