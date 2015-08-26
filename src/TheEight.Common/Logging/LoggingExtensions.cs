using Microsoft.Framework.Logging;
using NLog;
using NLog.Config;
using NLog.Targets;

namespace TheEight.Common.Logging
{
    public static class LoggingExtensions
    {
        public static ILoggerFactory SetupNLog(this ILoggerFactory loggerFactory, string basePath, bool debugMode)
        {
            var nLogFileTarget = new FileTarget
            {
                Name = "file",
                FileName = $"{basePath}/log.txt"
            };

            var nLogConfig = new LoggingConfiguration();
            nLogConfig.AddTarget("file", nLogFileTarget);
            nLogConfig.LoggingRules.Add(new LoggingRule("*", NLog.LogLevel.Info, nLogFileTarget));

            if (debugMode)
            {
                return loggerFactory
                    .AddConsole()
                    .AddNLog(new LogFactory(nLogConfig));
            }
            
            return loggerFactory.AddNLog(new LogFactory(nLogConfig));
        }
    }
}