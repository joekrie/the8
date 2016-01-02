using System;
using System.Collections.Generic;
using TheEight.Common.Domain.Messaging;

namespace TheEight.Common.DataAccess.Messaging
{
    public interface IMessageRepository
    {
        IEnumerable<Message> GetMessages();
    }
}