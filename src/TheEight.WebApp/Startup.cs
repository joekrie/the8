using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using React.AspNet;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly bool _isDevelopment;
        private readonly IConfiguration _config;

        public Startup(IHostingEnvironment hostEnv)
        {
            _isDevelopment = hostEnv.IsDevelopment();
            
            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(hostEnv.ContentRootPath)
                .AddEnvironmentVariables()
                .AddUserSecrets()
                .AddApplicationInsightsSettings(_isDevelopment);

            _config = configBuilder.Build();
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
                //config.AllowMsieEngine = false;
                config.ReuseJavaScriptEngines = !_isDevelopment;
                config.LoadBabel = false;
                config.LoadReact = false;

                config.AddScriptWithoutTransform("~/app/server.js");
            });

            app.UseStaticFiles();
            app.UseMvc(ConfigureRouting);
        }
    }
}