using Microsoft.Framework.Configuration;

namespace TheEightSuite.Common
{
    public static class ConfigurationFactory
    {
        public static IConfiguration GetConfiguration(string basePath)
        {
            return new ConfigurationBuilder(basePath)
                .AddEnvironmentVariables()
                .AddUserSecrets()
                .Build();
        }
    }
}