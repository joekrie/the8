using Microsoft.AspNet.Builder;
using React.AspNet;
using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.PlatformAbstractions;
using TheEight.Common.Configuration;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private readonly IConfiguration _config;
        private readonly bool _isDevelopment;

        public Startup(IHostingEnvironment hostEnv, IApplicationEnvironment appEnv)
        {
            _isDevelopment = hostEnv.IsDevelopment();
            _config = ConfigurationHelpers.Create(appEnv.ApplicationBasePath, _isDevelopment);
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