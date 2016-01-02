using Microsoft.Extensions.Logging;
using NLog;
using NLog.Config;
using NLog.Targets;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private void ConfigureLogging(ILoggerFactory loggerFactory)
        {
            var nLogConfig = new LoggingConfiguration();

            var consoleTarget = new ColoredConsoleTarget();
            nLogConfig.AddTarget("console", consoleTarget);

            var fileTarget = new FileTarget();
            nLogConfig.AddTarget("file", fileTarget);

            consoleTarget.Layout = @"${date:format=HH\:mm\:ss} ${logger} ${message}";
            fileTarget.FileName = "${basedir}/file.txt";
            fileTarget.Layout = "${message}";

            var rule1 = new LoggingRule("*", NLog.LogLevel.Debug, consoleTarget);
            nLogConfig.LoggingRules.Add(rule1);

            var rule2 = new LoggingRule("*", NLog.LogLevel.Debug, fileTarget);
            nLogConfig.LoggingRules.Add(rule2);

            var nLogFactory = new LogFactory(nLogConfig);
            loggerFactory.AddNLog(nLogFactory);
        }
    }
}
