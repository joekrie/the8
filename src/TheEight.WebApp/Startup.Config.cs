using Microsoft.AspNet.Builder;
using Microsoft.Extensions.Logging;

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

            app.UseStaticFiles();
            app.UseMvc(ConfigureRouting);
        }
    }
}