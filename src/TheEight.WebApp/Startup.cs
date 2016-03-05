using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly bool _isDevelopment;
        private readonly string _appBasePath;
        private readonly IConfiguration _config;

        public Startup(IHostingEnvironment hostEnv, IApplicationEnvironment appEnv)
        {
            _isDevelopment = hostEnv.IsDevelopment();
            _appBasePath = appEnv.ApplicationBasePath;

            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(_appBasePath)
                .AddEnvironmentVariables()
                .AddUserSecrets()
                .AddApplicationInsightsSettings();

            _config = configBuilder.Build();
        }
        
        public static void Main(string[] args)
        {
            //var application = new WebApplication();

            //application
            //    .UseConfiguration(WebApplicationConfiguration.GetDefault(args))
            //    .UseStartup<Startup>()
            //    .Build();
            
            //application.Run();
        }
    }
}