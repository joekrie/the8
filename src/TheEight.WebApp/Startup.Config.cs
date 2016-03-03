using Microsoft.AspNet.Builder;
using Microsoft.Extensions.Logging;
using React.AspNet;

namespace TheEight.WebApp
{
    public partial class Startup
    {
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
            //app.UseMvc(ConfigureRouting);
            app.UseMvc();
        }
    }
}
