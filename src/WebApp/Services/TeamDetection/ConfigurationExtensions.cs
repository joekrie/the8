using Microsoft.AspNet.Builder;
using Microsoft.Framework.DependencyInjection;

namespace TheEightSuite.WebApp.Services.TeamDetection
{
    public static class ConfigurationExtensions
    {
        public static IApplicationBuilder UseTeamDetector(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TeamDetectorMiddleware>();
        }

        public static IServiceCollection AddTeamDetector(this IServiceCollection services)
        {
            return services.AddSingleton<TeamDetector>();
        }
    }
}