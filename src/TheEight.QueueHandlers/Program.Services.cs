using System;
using Autofac;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Autofac.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using TheEight.Common.Infrastructure.Configuration.ExternalServices;
using TheEight.Common.Infrastructure.Configuration.Infrastructure;
using TheEight.Common.Infrastructure.Configuration.Security;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static IServiceProvider ConfigureServices()
        {
            var services = new ServiceCollection();
            var appBasePath = PlatformServices.Default.Application.ApplicationBasePath;

            services.AddOptions();

            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(appBasePath)
                .AddEnvironmentVariables()
                .AddUserSecrets();

            var config = configBuilder.Build();

            services
                .Configure<GoogleSettings>(config.GetSection("Google"))
                .Configure<FacebookSettings>(config.GetSection("Facebook"))
                .Configure<TwilioSettings>(config.GetSection("Twilio"))
                .Configure<SendGridSettings>(config.GetSection("SendGrid"))
                .Configure<AzureStorageSettings>(config.GetSection("AzureStorage"))
                .Configure<DatabaseSettings>(config.GetSection("Database"));


            var autofacBuilder = new ContainerBuilder();
            autofacBuilder.Populate(services);

            return autofacBuilder
                .Build()
                .Resolve<IServiceProvider>();
        }
    }
}