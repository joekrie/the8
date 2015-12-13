using System.Collections.Generic;
using TheEight.Common.Domain.Messaging;

namespace TheEight.Common.Domain.Accounts
{
    public class UserContactInfo
    {
        public string Email { get; set; }
        public string Phone { get; set; }

        public IDictionary<NotificationType, MessageMethod> NotificationMethods { get; set; }
            = new Dictionary<NotificationType, MessageMethod>();
    }
}