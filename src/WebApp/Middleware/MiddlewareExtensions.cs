using Microsoft.AspNet.Builder;

namespace TheEightSuite.WebApp.Middleware
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseTeamDetectorMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TeamDetectorMiddleware>();
        }
    }
}