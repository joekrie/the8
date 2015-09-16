using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Diagnostics;
using Microsoft.AspNet.Hosting;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Logging;
using Microsoft.Framework.OptionsModel;
using Microsoft.Framework.Runtime;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEight.Common.Config;
using TheEight.Common.Configuration;
using TheEight.Common.Database;
using TheEight.Common.Logging;

namespace TheEight.WebApp
{
    public class Startup
    {
        private readonly IApplicationEnvironment _appEnv;
        private readonly IConfiguration _config;
        private readonly IHostingEnvironment _hostEnv;
        private ILogger _logger;

        public Startup(IApplicationEnvironment applicationEnvironment, IHostingEnvironment hostingEnvironment)
        {
            _appEnv = applicationEnvironment;
            _hostEnv = hostingEnvironment;
            _config = ConfigurationFactory.GetConfiguration(_appEnv.ApplicationBasePath);
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();

            services.Configure<FacebookSettings>(_config.GetConfigurationSection("Facebook"));
            services.Configure<GoogleSettings>(_config.GetConfigurationSection("Google"));
            services.Configure<MicrosoftAccountSettings>(_config.GetConfigurationSection("MicrosoftAccount"));

            if (_appEnv.Configuration == "Debug")
            {
                services.AddSingleton(provider => DocumentStoreFactory.GetDevelopmentDocumentStore());
            }
            else
            {
                services.Configure<RavenHqSettings>(_config.GetConfigurationSection("RavenHq"));

                services.AddSingleton(provider =>
                {
                    var settings = provider.GetRequiredService<IOptions<RavenHqSettings>>();
                    return DocumentStoreFactory.GetCloudDocumentStore(settings.Options);
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
            _logger = loggerFactory
                .SetupNLog(_appEnv.ApplicationBasePath, _appEnv.Configuration == "Debug")
                .CreateLogger(_appEnv.ApplicationName);
            
            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
