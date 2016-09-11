using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using TheEight.Common.JsonSerialization;

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
            //if (_isDevelopment)
            {
                app.UseDeveloperExceptionPage();
            //}

            //ConfigureAuth(app);

            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();

            JsonConvert.DefaultSettings = () => new JsonSerializerSettings().Configure(_isDevelopment);
        }
    }
}
