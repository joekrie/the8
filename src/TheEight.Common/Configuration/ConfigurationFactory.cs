using Microsoft.Framework.Configuration;

namespace TheEight.Common.Configuration
{
    public static class ConfigurationFactory
    {
        public static IConfiguration GetConfiguration(string basePath)
        {
            return new ConfigurationBuilder(basePath)
                .AddEnvironmentVariables("APPSETTING_")
                .AddUserSecrets()
                .Build();
        }
    }
}