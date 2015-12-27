using System;

namespace TheEight.Common.Domain.Messaging
{
    [Flags]
    public enum MessageMethod
    {
        None = 0,
        Email = 1,
        TextMessage = 2
    }
}