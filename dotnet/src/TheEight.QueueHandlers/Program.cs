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
using TheEight.Messaging;

namespace TheEight.QueueHandlers
{
    public class Program
    {
        public static void Main()
        {
            var serviceProvider = ConfigureServices();
            var azureSettings = serviceProvider.Resolve<IOptions<AzureStorageOptions>>().Value;
            System.Console.WriteLine("conn str: " + azureSettings.StorageConnectionString);
            var jobActivator = new AutofacJobActivator(serviceProvider);

            var jobHostConfig = new JobHostConfiguration
            {
                StorageConnectionString = azureSettings.StorageConnectionString,
                DashboardConnectionString = azureSettings.DashboardConnectionString,
                JobActivator = jobActivator
            };

            JsonConvert.DefaultSettings = () => new JsonSerializerSettings().Configure();
            
            var host = new JobHost(jobHostConfig);
            System.Console.WriteLine("host created");
            host.RunAndBlock();
        }

        public static IContainer ConfigureServices()
        {
            var services = new ServiceCollection();
            var appBasePath = PlatformServices.Default.Application.ApplicationBasePath;

            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(appBasePath)
                .AddEnvironmentVariables();
                //.AddUserSecrets();

            var config = configBuilder.Build();

            services.AddScoped<EmailSender>();

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
