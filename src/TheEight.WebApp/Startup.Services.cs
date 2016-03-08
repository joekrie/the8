using System;
using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using React.AspNet;
using TheEight.Common.Infrastructure;
using TheEight.Common.Infrastructure.Configuration.ExternalServices;
using TheEight.Common.Infrastructure.Configuration.Infrastructure;
using TheEight.Common.Infrastructure.Configuration.Security;
using TheEight.Common.Infrastructure.DependencyInjection;
using TheEight.WebApp.Services.Invites;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var thisAssembly = Assembly.GetExecutingAssembly();
            var autofacBuilder = new ContainerBuilder();

            services
                .AddMvc()
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ConfigureForTheEight(_isDevelopment);
                })
                .AddMvcOptions(options =>
                {
                    if (!_isDevelopment)
                    {
                        options.Filters.Add(new RequireHttpsAttribute());
                    }
                });
            
            services.AddReact();
            services.AddApplicationInsightsTelemetry(_config);
            services.AddOptions();

            services
                .Configure<GoogleSettings>(_config.GetSection("Google"))
                .Configure<FacebookSettings>(_config.GetSection("Facebook"))
                .Configure<TwilioSettings>(_config.GetSection("Twilio"))
                .Configure<SendGridSettings>(_config.GetSection("SendGrid"))
                .Configure<AzureStorageSettings>(_config.GetSection("AzureStorage"))
                .Configure<DatabaseSettings>(_config.GetSection("Database"));

            autofacBuilder
                .RegisterAssemblyTypes(thisAssembly)
                .Where(type => type.IsInNamespace("TheEight.WebApp.Repositories"))
                .SingleInstance()
                .AsImplementedInterfaces();

            autofacBuilder
                .RegisterAssemblyTypes(thisAssembly)
                .Where(type => type.IsInNamespace("TheEight.WebApp.Services"))
                .SingleInstance()
                .AsImplementedInterfaces();

            autofacBuilder
                .Register(ctx => SystemClock.Instance)
                .As<IClock>()
                .SingleInstance();
            
            autofacBuilder.RegisterModule(new DataAccessModule());
            autofacBuilder.Populate(services);
            
            return autofacBuilder
                .Build()
                .Resolve<IServiceProvider>();
        }
    }
}