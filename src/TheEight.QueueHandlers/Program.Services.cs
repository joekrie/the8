using System;
using Autofac;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Autofac.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using TheEight.Options;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static IServiceProvider ConfigureServices()
        {
            var services = new ServiceCollection();
            var appBasePath = PlatformServices.Default.Application.ApplicationBasePath;

            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(appBasePath)
                .AddEnvironmentVariables()
                .AddUserSecrets();

            var config = configBuilder.Build();
            
            services
                .AddOptions()
                .Configure<AzureStorageOptions>(config.GetSection("AzureStorage"));

            var autofacBuilder = new ContainerBuilder();
            autofacBuilder.Populate(services);
            return autofacBuilder.Build().Resolve<IServiceProvider>();
        }
    }
}