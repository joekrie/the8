using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.PlatformAbstractions;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly bool _isDevelopment;
        private readonly string _appBasePath;

        public Startup(IHostingEnvironment hostEnv, IApplicationEnvironment appEnv)
        {
            _isDevelopment = hostEnv.IsDevelopment();
            _appBasePath = appEnv.ApplicationBasePath;
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