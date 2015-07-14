using System.IO;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Diagnostics;
using Microsoft.AspNet.Http;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Runtime;
using Raven.Client;
using TheEightSoftware.TheEightSuite.Core.Db;

namespace TheEightSoftware.TheEightSuite.WebApp
{
    public class Startup
    {
        public IConfiguration Configuration { get; private set; }

        public void ConfigureServices(IServiceCollection services)
        {
            var applicationEnvironment = services.BuildServiceProvider().GetRequiredService<IApplicationEnvironment>();

            Configuration = new ConfigurationBuilder(applicationEnvironment.ApplicationBasePath)
                .AddJsonFile("Config.json")
                .AddEnvironmentVariables()
                .Build();

            var dataDir = Path.Combine(applicationEnvironment.ApplicationBasePath, "data");
            services.AddSingleton(provider => DocumentStoreFactory.GetDocumentStore(dataDir));
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseErrorPage(new ErrorPageOptions
            {
                ShowCookies = true,
                ShowEnvironment = true,
                ShowExceptionDetails = true,
                ShowHeaders = true,
                ShowQuery = true,
                ShowSourceCode = true,
                SourceCodeLineCount = 20
            });

            app.Run(async context =>
            {
                using (var dbSession = app.ApplicationServices.GetService<IDocumentStore>().OpenAsyncSession())
                {
                    await dbSession.StoreAsync(new StoreMe { Prop1 = "teams/1"});
                    await dbSession.SaveChangesAsync();
                    var storeMe = await dbSession.Query<StoreMe>().FirstAsync();
                    await context.Response.WriteAsync(storeMe.Prop1);
                }
            });
        }

        public class StoreMe
        {
            public string Prop1 { get; set; }
        }
    }
}
