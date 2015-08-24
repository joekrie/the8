using Microsoft.Framework.Logging;
using NLog;
using NLog.Config;
using NLog.Targets;
using LogLevel = NLog.LogLevel;

namespace TheEightSuite.Common
{
    public static class LoggingExtensions
    {
        public static ILoggerFactory Setup(this ILoggerFactory loggerFactory, string basePath, bool debugMode)
        {
            var nLogFileTarget = new FileTarget
            {
                Name = "file",
                FileName = $"{basePath}/log.txt"
            };

            var nLogConfig = new LoggingConfiguration();
            nLogConfig.AddTarget("file", nLogFileTarget);
            nLogConfig.LoggingRules.Add(new LoggingRule("*", LogLevel.Info, nLogFileTarget));

            if (debugMode)
            {
                return loggerFactory
                    .AddConsole()
                    .AddNLog(new LogFactory(nLogConfig));
            }
            
            return loggerFactory
                .AddNLog(new LogFactory(nLogConfig));
        }
    }
}