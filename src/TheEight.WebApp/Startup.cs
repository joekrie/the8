using Microsoft.AspNet.Builder;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.OptionsModel;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEight.Common.Config;
using TheEight.Common.Database;
using React.AspNet;
using System;
using Microsoft.Dnx.Runtime;
using Microsoft.AspNet.Diagnostics;

namespace TheEight.WebApp
{
    public class Startup
    {
        private IConfiguration _config;

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var applicationEnvironment = services
                .BuildServiceProvider()
                .GetRequiredService<IApplicationEnvironment>();

            _config = new ConfigurationBuilder(applicationEnvironment.ApplicationBasePath)
                .AddEnvironmentVariables("APPSETTING_")
                .AddUserSecrets()
                .Build();

            services.AddOptions();

            services.Configure<GoogleSettings>(_config.GetSection("Google"));
            services.Configure<RavenSettings>(_config.GetSection("Raven"));

            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<RavenSettings>>();
                return DocumentStoreFactory.CreateAndInitialize(settings.Options);
            });

            services.AddMvc()
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                    options.SerializerSettings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                });

            services.AddReact();

            return services.BuildServiceProvider();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.Properties["host.AppMode"] = "development";
            app.UseErrorPage();

            app.UseReact(config =>
            {
                config
                    .SetUseHarmony(false)
                    .SetReuseJavaScriptEngines(true)
                    .AddScript("~/app/boat-lineup-planner/main.js");
            });

            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
