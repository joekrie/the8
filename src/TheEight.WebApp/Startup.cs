using Microsoft.AspNet.Builder;
using React.AspNet;
using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.PlatformAbstractions;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly IConfiguration _config;
        private readonly bool _isDevelopment;

        public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv)
        {
            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(appEnv.ApplicationBasePath)
                .AddEnvironmentVariables();

            _isDevelopment = env.IsDevelopment();

            if (_isDevelopment)
            {
                configBuilder.AddUserSecrets();
            }
            
            _config = configBuilder.Build();
        }

        public void Configure(IApplicationBuilder app)
        {
            if (_isDevelopment)
            {
                app.UseDeveloperExceptionPage();
            }
            
            ConfigureAuth(app);

            app.UseReact(config =>
            {
                config.SetLoadBabel(false)
                    .SetLoadReact(false)
                    .AddScriptWithoutTransform("~/app/server.js");
            });

            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}