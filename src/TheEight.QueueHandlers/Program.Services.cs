using System;
using Autofac;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Autofac.Extensions.DependencyInjection;
using TheEight.Common.Infrastructure;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static IServiceProvider ConfigureServices()
        {
            var services = new ServiceCollection();
            var appBasePath = PlatformServices.Default.Application.ApplicationBasePath;
            
            services.AddTheEightConfiguration(appBasePath);

            var autofacBuilder = new ContainerBuilder();
            
            // register services here

            autofacBuilder.Populate(services);
            var container = autofacBuilder.Build();

            return container.Resolve<IServiceProvider>();
        }
    }
}