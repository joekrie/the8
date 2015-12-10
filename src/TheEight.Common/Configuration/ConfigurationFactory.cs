using Microsoft.Extensions.Configuration;

namespace TheEight.Common.Configuration
{
    public static class ConfigurationFactory
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
    }
}
