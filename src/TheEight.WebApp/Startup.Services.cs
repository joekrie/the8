using System;
using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEight.Options;

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
                    var settings = options.SerializerSettings;

                    settings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                    settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                    settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

                    if (_isDevelopment)
                    {
                        settings.Formatting = Formatting.Indented;
                    }
                })
                .AddMvcOptions(options =>
                {
                    if (!_isDevelopment)
                    {
                        options.Filters.Add(new RequireHttpsAttribute());
                    }
                });
            
            services.AddApplicationInsightsTelemetry(_config.GetSection("AzureAppInsights"));
            
            services
                .AddOptions()
                .Configure<SqlServerOptions>(opts =>
                {
                    var sqlSettings = _config.GetSection("SqlServer");
                })
                .Configure<AzureActiveDirectoryOptions>(opts =>
                {
                    var adSettings = _config.GetSection("AzureAD");
                });
            
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
            
            autofacBuilder.Populate(services);
            return autofacBuilder.Build().Resolve<IServiceProvider>();
        }
    }
}