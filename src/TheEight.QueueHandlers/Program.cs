using Autofac;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.OptionsModel;
using TheEight.Common.Configuration.Models;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static IContainer AutofacContainer;

        public Program()
        {
            BuildAutofacContainer();
        }

        public static void Main()
        {
            var azureSettings = AutofacContainer.Resolve<IOptions<AzureSettings>>().Value;
            var jobActivator = new JobActivator(AutofacContainer);

            var jobHostConfig = new JobHostConfiguration
            {
                StorageConnectionString = azureSettings.Storage.StorageConnectionString,
                DashboardConnectionString = azureSettings.Storage.DashboardConnectionString,
                JobActivator = jobActivator
            };

            var host = new JobHost(jobHostConfig);
            host.RunAndBlock();
        }
    }
}