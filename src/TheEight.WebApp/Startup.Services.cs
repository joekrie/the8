using System;
using System.Reflection;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
//using React.AspNet; // waiting for React.NET to catch up to RC2
using TheEight.Common.Infrastructure;
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

            services.AddTheEightConfiguration(_appBasePath,
                builder =>
                {
                    if (_isDevelopment)
                    {
                        builder.AddJsonFile("appsettings.develop.json");
                    }
                });

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
            
            //services.AddReact();

            autofacBuilder
                .RegisterAssemblyTypes(thisAssembly)
                .Where(TypeIsRepositoryOrService)
                .InstancePerDependency()
                .AsImplementedInterfaces();

            autofacBuilder
                .Register(ctx => SystemClock.Instance)
                .As<IClock>()
                .SingleInstance();

            autofacBuilder
                .RegisterType<AccessCodeGenerator>()
                .As<IAccessCodeGenerator>()
                .SingleInstance();
            
            autofacBuilder.RegisterModule(new DataAccessModule());
            autofacBuilder.Populate(services);

            var container = autofacBuilder.Build();
            return container.Resolve<IServiceProvider>();
        }

        private static bool TypeIsRepositoryOrService(Type type)
        {
            if (type.IsInNamespace("TheEight.WebApp.Repositories") 
                && type.Name.EndsWith("Repository"))
            {
                return true;
            }

            if (type.IsInNamespace("TheEight.WebApp.Services") 
                && type.Name.EndsWith("Service"))
            {
                return true;
            }

            return false;
        }
    }
}