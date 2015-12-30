using System;
using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.DependencyInjection;
using React.AspNet;
using TheEight.Common.Configuration;
using TheEight.Common.Json;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var autofacBuilder = new ContainerBuilder();

            services.AddOptions();

            services
                .AddMvc()
                .AddJsonOptions(
                    options => options.SerializerSettings.Configure(_isDevelopment))
                .AddMvcOptions(
                    options =>
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
