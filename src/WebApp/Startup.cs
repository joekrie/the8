using Microsoft.AspNet.Builder;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Runtime;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEightSuite.Data;

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

            var configBuilder = new ConfigurationBuilder(basePath)
                .AddJsonFile("Config.json");

            if (_applicationEnvironment.Configuration == "Debug")
            {
                configBuilder.AddUserSecrets();
                services.AddSingleton(provider => DocumentStoreFactory.GetDevelopmentDocumentStore());
            }
            else
            {
                configBuilder.AddEnvironmentVariables();

                var url = _configuration.Get("Raven:Url");
                var apiKey = _configuration.Get("Raven:ApiKey");
                services.AddSingleton(provider => DocumentStoreFactory.GetCloudDocumentStore(url, apiKey));
            }

            _configuration = configBuilder.Build();

            services.AddMvc();

            services.ConfigureMvc(options =>
            {
                options.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                options.SerializerSettings.Converters.Add(new StringEnumConverter {CamelCaseText = true});
                options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            });
        }

        public void ConfigureDevelopment(IApplicationBuilder app)
        {
            app.UseErrorPage();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
