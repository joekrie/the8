using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly bool _isDevelopment;
        private readonly IConfiguration _config;

        public Startup(IHostingEnvironment hostEnv, IApplicationEnvironment appEnv)
        {
            _isDevelopment = hostEnv.IsDevelopment();
            var appBasePath = appEnv.ApplicationBasePath;
            
            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(appBasePath)
                .AddEnvironmentVariables()
                .AddUserSecrets()
                .AddApplicationInsightsSettings(_isDevelopment);

            _config = configBuilder.Build();
        }
    }
}