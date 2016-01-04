using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using TheEight.Common.Configuration;

namespace TheEight.Common
{
    public static class StartupExtensions
    {
        public static IServiceCollection AddTheEightConfiguration(this IServiceCollection services, string appBasePath, 
            Action<IConfigurationBuilder> additionalConfig = null)
        {
            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(appBasePath)
                .AddEnvironmentVariables()
                .AddUserSecrets();

            additionalConfig?.Invoke(configBuilder);
            var config = configBuilder.Build();

            return services
                .AddOptions()
                .Configure<GoogleSettings>(config.GetSection("Google"))
                .Configure<FacebookSettings>(config.GetSection("Facebook"))
                .Configure<TwilioSettings>(config.GetSection("Twilio"))
                .Configure<SendGridSettings>(config.GetSection("SendGrid"))
                .Configure<AzureStorageSettings>(config.GetSection("AzureStorage"))
                .Configure<DatabaseSettings>(config.GetSection("Database"));
        }

        public static JsonSerializerSettings ConfigureForTheEight(this JsonSerializerSettings settings, bool prettyPrint)
        {
            settings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
            settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            if (prettyPrint)
            {
                settings.Formatting = Formatting.Indented;
            }

            return settings;
        }
    }
}
