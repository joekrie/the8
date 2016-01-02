using Microsoft.AspNet.Builder;
using React.AspNet;
using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.PlatformAbstractions;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly string _appBasePath;
        private readonly bool _isDevelopment;

        public Startup(IHostingEnvironment hostEnv, IApplicationEnvironment appEnv)
        {
            _isDevelopment = hostEnv.IsDevelopment();
            _appBasePath = appEnv.ApplicationBasePath;
        }

        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory)
        {
            if (_isDevelopment)
            {
                app.UseDeveloperExceptionPage();
            }
            
            ConfigureAuth(app);
            ConfigureLogging(loggerFactory);

            app.UseReact(config =>
            {
                config.SetLoadBabel(false);
                config.SetLoadReact(false);
                config.AddScriptWithoutTransform("~/app/server.js");
            });

            app.UseStaticFiles();
            app.UseMvc();
        }
        
        public static void Main(string[] args)
        {
            var application = new WebApplicationBuilder()
                .UseConfiguration(WebApplicationConfiguration.GetDefault(args))
                .UseStartup<Startup>()
                .Build();
            
            application.Run();
        }
    }
}