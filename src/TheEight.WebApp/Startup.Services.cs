using System;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using React.AspNet;
using TheEight.Common;
using TheEight.WebApp.Services;
using NodaTime.Serialization.JsonNet;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddConfigurationServices(_config);
            services.AddRavenDbServices();

            // todo: scan assembly for services
            services.AddTransient<UserService>();

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

            return services.BuildServiceProvider();
        }
    }
}
