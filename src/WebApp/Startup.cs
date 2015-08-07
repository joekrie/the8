using Microsoft.AspNet.Builder;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Runtime;
using Newtonsoft.Json.Converters;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEightSuite.BusinessLogic.Database;
using TheEightSuite.BusinessLogic.DependencyInjection;

namespace TheEightSuite.WebApp
{
    public class Startup
    {
        private readonly IApplicationEnvironment _applicationEnvironment;
        private IConfiguration _configuration;

        public Startup(IApplicationEnvironment applicationEnvironment)
        {
            _applicationEnvironment = applicationEnvironment;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var basePath = _applicationEnvironment.ApplicationBasePath;

            _configuration = new ConfigurationBuilder(basePath)
                .AddJsonFile("Config.json")
                .AddUserSecrets()
                .AddEnvironmentVariables()
                .Build();

            var ravenHqUrl = _configuration.Get("RavenHqUrl");
            var ravenHqApiKey = _configuration.Get("RavenHqApiKey");
            services.AddBusinessLogicServices(new RavenHqDocumentStoreInitializer(ravenHqUrl, ravenHqApiKey));

            services.AddMvc();
            services.ConfigureMvc(options =>
            {
                options.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                options.SerializerSettings.Converters.Add(new StringEnumConverter());
            });
        }

        public void ConfigureDevelopment(IApplicationBuilder app)
        {
            app.UseErrorPage();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();
        }
    }
}
