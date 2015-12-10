using System.Net;
using System.Net.Mail;
using Microsoft.AspNet.Hosting;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using Microsoft.Extensions.PlatformAbstractions;
using TheEight.Common;
using TheEight.Common.Configuration;
using TheEight.Common.Configuration.Models;
using TheEight.QueueHandlers.Handlers;
using Twilio;

namespace TheEight.QueueHandlers
{
    // injecting appEnv is deprecated
    // make static Main: https://github.com/aspnet/Entropy/blob/dev/samples/Runtime.ApplicationEnvironment/Program.cs
    public class Program
    {
        private readonly IJobActivator _jobActivator;

        public Program(IApplicationEnvironment appEnv)
        {
            var isDevelopment = appEnv.Configuration == "Debug";
            var services = new ServiceCollection();

            var config = ConfigurationFactory.Create(appEnv.ApplicationBasePath, isDevelopment);
            services.AddConfigurationServices(config);

            services.AddSingleton(provider => JsonSerializerHelpers.CreateJsonSerializer(isDevelopment));

            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<TwilioSettings>>().Value;
                return new TwilioRestClient(settings.AccountSid, settings.AuthToken);
            });
            
            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<MailgunSettings>>().Value;

                return new SmtpClient
                {
                    Host = settings.Smtp.Host,
                    Port = settings.Smtp.Port,
                    Credentials = new NetworkCredential(settings.Smtp.Username, settings.Smtp.Password)
                };
            });

            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<AzureSettings>>().Value;

                var jobHostConfig = new JobHostConfiguration
                {
                    StorageConnectionString = settings.Storage.StorageConnectionString,
                    JobActivator = _jobActivator
                };

                if (!isDevelopment)
                {
                    jobHostConfig.DashboardConnectionString = settings.Storage.DashboardConnectionString;
                }

                return jobHostConfig;
            });

            // todo: scan assembly for handlers
            services.AddTransient<MessageHandler>();

            var serviceProvider = services.BuildServiceProvider();
            _jobActivator = new JobActivator(serviceProvider);
        }

        public void Main()
        {
            var jobHostConfig = _jobActivator.CreateInstance<JobHostConfiguration>();
            var host = new JobHost(jobHostConfig);
            host.RunAndBlock();
        }
    }
}