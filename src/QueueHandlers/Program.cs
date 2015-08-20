using System.Net;
using System.Net.Mail;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Twilio;

namespace TheEightSuite.QueueHandlers
{
    public class Program
    {
        private readonly IJobActivator _jobActivator;
        private readonly IConfiguration _configuration;

        public Program()
        {
            _configuration = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .AddUserSecrets()
                .Build();

            var services = new ServiceCollection()
                .AddSingleton(provider => new TwilioRestClient(, ))
                .AddSingleton(provider => new SmtpClient
                {
                    Host = "smtp.mailgun.org",
                    Credentials = new NetworkCredential("postmaster@theeightsoftware.com", "e094a4b4b79129d3d596df8b03865499")
                });

            var serviceProvider = services.BuildServiceProvider();
            _jobActivator = new JobActivator(serviceProvider);
        }

        public void Main(string[] args)
        {
            var host = new JobHost(
                new JobHostConfiguration
                {
                    DashboardConnectionString = @"DefaultEndpointsProtocol=https;AccountName=theeightsuite;AccountKey=aFl1A10SDRSvA73JbG/K/U0bswtYisWy89Zg5ahxWE76XI1lrlKcKgJQQBoQskyoddg89G/oqNCzZUaxktb5fw==",
                    StorageConnectionString = @"DefaultEndpointsProtocol=https;AccountName=theeightsuite;AccountKey=aFl1A10SDRSvA73JbG/K/U0bswtYisWy89Zg5ahxWE76XI1lrlKcKgJQQBoQskyoddg89G/oqNCzZUaxktb5fw==",
                    JobActivator = _jobActivator
                });

            host.RunAndBlock();
        }
    }
}
