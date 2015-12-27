using System;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using Autofac;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using Microsoft.Extensions.PlatformAbstractions;
using TheEight.Common.Autofac.Modules;
using TheEight.Common.Configuration;
using TheEight.Common.Configuration.Models;
using TheEight.QueueHandlers.Handlers;
using TheEight.QueueHandlers.Services.Messaging;
using Twilio;
using Autofac.Extensions.DependencyInjection;
using System.Linq;
using RestSharp;
using RestSharp.Authenticators;

namespace TheEight.QueueHandlers
{
    public partial class Program
    {
        private static void RegisterServices(ContainerBuilder autofacBuilder)
        {
            autofacBuilder
                .RegisterAssemblyTypes(Assembly.GetExecutingAssembly())
                .Where(t => t.IsInNamespaceOf<MessageHandler>() || t.IsInNamespaceOf<MessageBatchProcessor>())
                .AsSelf()
                .InstancePerDependency();
        }

        private static void BuildAutofacContainer()
        {
            var isDev = PlatformServices.Default.Application.Configuration == "Debug";
            var appBasePath = PlatformServices.Default.Application.ApplicationBasePath;

            var config = ConfigurationHelpers.Create(appBasePath, isDev);
            var services = new ServiceCollection();
            services.AddConfigurationServices(config);

            var autofacBuilder = new ContainerBuilder();
            autofacBuilder.Populate(services.ToList());
            
            RegisterServices(autofacBuilder);

            AutofacContainer = autofacBuilder.Build();
        }
    }
}