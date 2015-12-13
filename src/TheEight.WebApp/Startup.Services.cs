using System;
using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.DependencyInjection;
using React.AspNet;
using TheEight.Common.Autofac.Modules;
using TheEight.WebApp.Services;
using TheEight.Common.Configuration;
using TheEight.Common.Json;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var autofacBuilder = new ContainerBuilder();
            
            services.AddConfigurationServices(_config);

            autofacBuilder.RegisterModule(new RavenDbModule());

            var thisAssembly = Assembly.GetExecutingAssembly();

            autofacBuilder
                .RegisterAssemblyTypes(thisAssembly)
                .Where(t => t.IsInNamespaceOf<UserService>())
                .AsSelf();

            services
                .AddMvc()
                .AddJsonOptions(options => options.SerializerSettings.Configure(_isDevelopment))
                .AddMvcOptions(options =>
                {
                    if (!_isDevelopment)
                    {
                        options.Filters.Add(new RequireHttpsAttribute());
                    }
                });

            services.AddReact();

            autofacBuilder.Populate(services);
            var container = autofacBuilder.Build();
            return container.Resolve<IServiceProvider>();
        }
    }
}
