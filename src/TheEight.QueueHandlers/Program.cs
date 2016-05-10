using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;

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
            //var azureSettings = ServiceProvider.GetService<IOptions<AzureStorageSettings>>().Value;
            var connStr = "DefaultEndpointsProtocol=https;AccountName=the8sandbox;AccountKey=20ZdpfxcGC/Q0oMYEI47wYD40OSReNnSWRUPgK3athlMw3bpDdGR/a6F1cuyRRP5jv1OD+m2z1cG24w229INzw==";

            var jobActivator = new JobActivator(ServiceProvider);

            var jobHostConfig = new JobHostConfiguration
            {
                StorageConnectionString = connStr,
                DashboardConnectionString = connStr,
                JobActivator = jobActivator
            };

            var host = new JobHost(jobHostConfig);
            host.RunAndBlock();
        }
    }
}