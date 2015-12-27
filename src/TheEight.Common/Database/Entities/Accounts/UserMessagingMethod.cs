using Microsoft.Data.Entity.Metadata.Builders;
using TheEight.Common.Domain.Messaging;

namespace TheEight.Common.Database.Entities.Accounts
{
    public class UserMessagingMethod
    {
        public int UserMessagingMethodId { get; set; }

        public MessageType MessageType { get; set; }
        public MessageMethod MessageMethod { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        internal static void BuildEntityType(EntityTypeBuilder<UserMessagingMethod> entityTypeBuilder)
        {
            entityTypeBuilder
                .HasAlternateKey(ump => new {ump.MessageType, ump.UserId});
        }
    }
}