using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using TheEight.Common.Domain.Messaging;

namespace TheEight.QueueHandlers.Handlers
{
    public class MessageHandler
    {

        public async Task ProcessMessageBatchAsync([QueueTrigger("messages")] MessageBatch batch)
        {

        }
    }
}
