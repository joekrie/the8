using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheEight.Common.Configuration.Models;

namespace TheEight.Common.Configuration
{
    public static class ConfigurationHelpers
    {
        public static IConfiguration Create(string basePath, bool isDevelopment)
        {
            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddEnvironmentVariables();
            
            if (isDevelopment)
            {
                configBuilder.AddUserSecrets();
            }

            return configBuilder.Build();
        }
        
        public static IServiceCollection AddConfigurationServices(this IServiceCollection services, 
            IConfiguration configuration)
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