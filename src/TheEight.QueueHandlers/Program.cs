using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.PlatformAbstractions;
using Newtonsoft.Json;
using TheEight.Common.JsonSerialization;
using TheEight.Options;

namespace TheEight.QueueHandlers
{
    public class Program
    {
        public static void Main()
        {
            var serviceProvider = ConfigureServices();
            var azureSettings = serviceProvider.Resolve<IOptions<AzureStorageOptions>>().Value;
            var jobActivator = new AutofacJobActivator(serviceProvider);

            var jobHostConfig = new JobHostConfiguration
            {
                StorageConnectionString = azureSettings.StorageConnectionString,
                DashboardConnectionString = azureSettings.DashboardConnectionString,
                JobActivator = jobActivator
            };

            JsonConvert.DefaultSettings = () => new JsonSerializerSettings().Configure();
            
            var host = new JobHost(jobHostConfig);
            host.RunAndBlock();
        }

        public static IContainer ConfigureServices()
        {
            var services = new ServiceCollection();
            var appBasePath = PlatformServices.Default.Application.ApplicationBasePath;

            var configBuilder = new ConfigurationBuilder()
                .SetBasePath("C:\\Users\\joekr\\Development\\The Eight\\src\\TheEight.QueueHandlers")
                .AddEnvironmentVariables()
                .AddUserSecrets();

            var config = configBuilder.Build();

            services
                .AddOptions()
                .Configure<AzureStorageOptions>(config.GetSection("AzureStorage"))
                .Configure<TwilioOptions>(config.GetSection("Twilio"))
                .Configure<MailgunOptions>(config.GetSection("Mailgun"));
            
            var autofacBuilder = new ContainerBuilder();

            autofacBuilder
                .RegisterAssemblyTypes(Assembly.GetExecutingAssembly())
                .Where(type => type.IsInNamespace("TheEight.QueueHandlers.Handlers"));
            
            autofacBuilder.Populate(services);
            return autofacBuilder.Build();
        }
    }
}
