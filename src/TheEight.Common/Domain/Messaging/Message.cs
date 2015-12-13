namespace TheEight.Common.Domain.Messaging
{
    public class Message
    {
        public EmailContent Email { get; set; }
        public TextMessageContent TextMessage { get; set; }
    }
}