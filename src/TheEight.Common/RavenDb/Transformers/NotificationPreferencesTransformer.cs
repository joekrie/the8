using System.Collections.Generic;
using Raven.Client.Indexes;
using System.Linq;
using TheEight.Common.Domain.Accounts;
using TheEight.Common.Domain.Messaging;

namespace TheEight.Common.RavenDb.Transformers
{
    public class NotificationPreferencesTransformer : AbstractTransformerCreationTask<User>
    {
        public const string Name = "User/NotificationPreferences";
        public override string TransformerName => Name;

        public NotificationPreferencesTransformer()
        {
            TransformResults = users => users
                .SelectMany(u => u.ContactInfo.NotificationMethods
                    .Select(kvp => new TransformResult
                    {
                        UserId = u.Id,
                        NotificationType = kvp.Key,
                        MessageMethod = kvp.Value
                    }));
        }
        
        public class TransformResult
        {
            public string UserId { get; set; }
            public NotificationType NotificationType { get; set; }
            public MessageMethod MessageMethod { get; set; }
        }
    }
}