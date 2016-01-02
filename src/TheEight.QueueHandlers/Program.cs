using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using TheEight.Common.Configuration;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static IServiceProvider ServiceProvider;

        public Program()
        {
            ServiceProvider = ConfigureServices();
        }

        public static void Main()
        {
            var azureSettings = ServiceProvider
                .GetService<IOptions<AzureStorageSettings>>()
                .Value;

            var jobActivator = new JobActivator(ServiceProvider);

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