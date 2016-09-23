using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Queue;
using Newtonsoft.Json;
using TheEight.Options;

namespace TheEight.QueuePusher
{
    public class QueuePusher
    {
        private readonly AzureStorageOptions _azureStorageOptions;
        private readonly JsonSerializer _jsonSerializer;

        public QueuePusher(IOptions<AzureStorageOptions> azureStorageOptions, JsonSerializer jsonSerializer)
        {
            _jsonSerializer = jsonSerializer;
            _azureStorageOptions = azureStorageOptions.Value;
        }

        public async Task AddMessage<T>(T message, string queueName)
        {
            var storageAccount = CloudStorageAccount.Parse(_azureStorageOptions.StorageConnectionString);
            var client = storageAccount.CreateCloudQueueClient();
            var jsonMessage = JsonConvert.SerializeObject(message);
            var queueMessage = new CloudQueueMessage(jsonMessage);
            var queue = client.GetQueueReference(queueName);
            await queue.AddMessageAsync(queueMessage);
        }
    }
}
