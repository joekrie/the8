using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using TheEight.Options;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static IServiceProvider _serviceProvider;

        public Program()
        {
            _serviceProvider = ConfigureServices();
        }

        public static void Main()
        {
           var azureSettings = _serviceProvider.GetService<IOptions<AzureStorageOptions>>().Value;
           var jobActivator = new JobActivator(_serviceProvider);

            var jobHostConfig = new JobHostConfiguration
            {
                StorageConnectionString = azureSettings.StorageConnectionString,
                DashboardConnectionString = azureSettings.DashboardConnectionString,
                JobActivator = jobActivator
            };

            var host = new JobHost(jobHostConfig);
            host.RunAndBlock();
        }
    }
}