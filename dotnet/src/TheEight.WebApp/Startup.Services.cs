using System;
using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using TheEight.Common.JsonSerialization;
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
                .AddJsonOptions(options => options.SerializerSettings.Configure(_isDevelopment))
                .AddMvcOptions(options =>
                {
                    if (!_isDevelopment)
                    {
                        //options.Filters.Add(new RequireHttpsAttribute());
                    }
                });
            
            services.AddApplicationInsightsTelemetry(_config.GetSection("AzureAppInsights"));
            
            services
                .AddOptions()
                .Configure<SqlServerOptions>(_config.GetSection("SqlServer"))
                .Configure<AzureActiveDirectoryOptions>(_config.GetSection("AzureAD"));
            
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
            var autofacContainer = autofacBuilder.Build();
            return autofacContainer.Resolve<IServiceProvider>();
        }
    }
}
