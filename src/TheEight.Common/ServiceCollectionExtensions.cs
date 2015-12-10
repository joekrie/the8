using System;
using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Indexes;
using Raven.Client.NodaTime;
using TheEight.Common.Configuration.Models;

namespace TheEight.Common
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddRavenDbServices(this IServiceCollection services)
        {
            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<RavenSettings>>().Value;

                var ravenStore = new DocumentStore
                {
                    Url = settings.Url,
                    ApiKey = settings.ApiKey,
                    DefaultDatabase = settings.DatabaseName
                }.Initialize();

                ravenStore.ConfigureForNodaTime();
                ravenStore.Conventions.IdentityPartsSeparator = "-";
                IndexCreation.CreateIndexes(Assembly.GetExecutingAssembly(), ravenStore);

                return ravenStore;
            });

            services.AddTransient(provider =>
            {
                var docStore = provider.GetRequiredService<IDocumentStore>();
                return docStore.OpenAsyncSession();
            });

            return services;
        }
        
        public static IServiceCollection AddConfigurationServices(this IServiceCollection services, IConfiguration configuration)
        {
            return services
                .AddOptions()
                .Configure<GoogleSettings>(configuration.GetSection("Google"))
                .Configure<RavenSettings>(configuration.GetSection("Raven"))
                .Configure<TwilioSettings>(configuration.GetSection("Twilio"))
                .Configure<MailgunSettings>(configuration.GetSection("Mailgun"))
                .Configure<AzureSettings>(configuration.GetSection("Azure"));
        }
    }
}
