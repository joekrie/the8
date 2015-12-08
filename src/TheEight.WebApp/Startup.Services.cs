using System;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using Raven.Client;
using TheEight.Common.OptionsModels;
using TheEight.Common.Raven;
using TheEight.Common.Services;
using NodaTime.Serialization.JsonNet;
using React.AspNet;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();

            services.Configure<GoogleSettings>(_config.GetSection("Google"));
            services.Configure<RavenSettings>(_config.GetSection("Raven"));

            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<RavenSettings>>().Value;
                return DocumentStoreFactory.Create(settings);
            });

            services.AddTransient(provider =>
            {
                var docStore = provider.GetRequiredService<IDocumentStore>();
                return docStore.OpenAsyncSession();
            });

            services.AddTransient<UserService>();

            services.AddMvc()
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                    options.SerializerSettings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                })
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
