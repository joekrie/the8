using System.Net;
using System.Net.Mail;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.OptionsModel;
using Microsoft.Framework.Runtime;
using TheEight.Common.Config;
using TheEight.Common.Configuration;
using TheEight.QueueHandlers.MessageQueue;
using Twilio;

namespace TheEight.QueueHandlers
{
    public class Program
    {
        private readonly IJobActivator _jobActivator;
        private readonly IConfiguration _config;
        private readonly IApplicationEnvironment _appEnv;

        public Program(IApplicationEnvironment applicationEnvironment)
        {
            _appEnv = applicationEnvironment;

            _config = ConfigurationFactory.GetConfiguration(_appEnv.ApplicationBasePath);

            var services = new ServiceCollection()
                .AddOptions()
                .Configure<TwilioSettings>(_config.GetConfigurationSection("Twilio"))
                .Configure<MailgunSettings>(_config.GetConfigurationSection("Mailgun"))
                .Configure<AzureSettings>(_config.GetConfigurationSection("Azure"))
                .AddSingleton(provider =>
                {
                    var settings = provider.GetRequiredService<IOptions<TwilioSettings>>().Options;
                    return new TwilioRestClient(settings.AccountSid, settings.AuthToken);
                })
                .AddSingleton(provider =>
                {
                    var settings = provider.GetRequiredService<IOptions<MailgunSettings>>().Options;

                    return new SmtpClient
                    {
                        Host = settings.Smtp.Host,
                        Port = settings.Smtp.Port,
                        Credentials = new NetworkCredential(settings.Smtp.Username, settings.Smtp.Password)
                    };
                })
                .AddSingleton(provider =>
                {
                    var settings = provider.GetRequiredService<IOptions<AzureSettings>>().Options;

                    return new JobHostConfiguration
                    {
                        StorageConnectionString = settings.Storage.ConnectionString,
                        JobActivator = _jobActivator,
                        DashboardConnectionString = _appEnv.Configuration == "Debug"
                            ? null
                            : settings.Dashboard.ConnectionString
                    };
                })
                .AddScoped<MessageQueueHandler>();

            var serviceProvider = services.BuildServiceProvider();
            _jobActivator = new JobActivator(serviceProvider);
        }

        public void Main(string[] args)
        {
            var host = new JobHost(_jobActivator.CreateInstance<JobHostConfiguration>());
            host.RunAndBlock();
        }
    }
}
