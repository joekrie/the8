using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Diagnostics;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Logging;
using Microsoft.Framework.Runtime;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEightSuite.Core;

namespace TheEightSuite.WebApp
{
    public class Startup
    {
        private readonly IApplicationEnvironment _applicationEnvironment;
        private readonly IConfiguration _configuration;
        private ILogger _logger;

        public Startup(IApplicationEnvironment applicationEnvironment)
        {
            _applicationEnvironment = applicationEnvironment;
            _configuration = ConfigurationFactory.GetConfiguration(_applicationEnvironment.ApplicationBasePath);
        }

        public void ConfigureServices(IServiceCollection services)
        {
            if (_applicationEnvironment.Configuration == "Debug")
            {
                services.AddSingleton(provider => DocumentStoreFactory.GetDevelopmentDocumentStore());
            }
            else
            {
                services.AddSingleton(provider =>
                {
                    var url = _configuration.Get("RavenHq:Url");
                    var apiKey = _configuration.Get("RavenHq:ApiKey");
                    return DocumentStoreFactory.GetCloudDocumentStore(url, apiKey);
                });
            }

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
            app.UseErrorPage(ErrorPageOptions.ShowAll);
        }

        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.Setup(_applicationEnvironment.ApplicationBasePath, _applicationEnvironment.Configuration == "Debug")
                .CreateLogger(_applicationEnvironment.ApplicationName);

            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
