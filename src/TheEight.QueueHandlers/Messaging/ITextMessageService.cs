using System.Collections.Generic;
using System.Threading.Tasks;

namespace TheEight.QueueHandlers.Messaging
{
    public interface ITextMessageService
    {
        Task SendTextMessageAsync(IEnumerable<string> recipientPhoneNumbers, string message);
    }
}