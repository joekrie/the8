using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;

namespace TheEightSuite.WebApp.Services.TeamDetection
{
    public class TeamDetectorMiddleware
    {
        private readonly RequestDelegate _next;

        public TeamDetectorMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext httpContext)
        {
            var host = httpContext.Request.Host.Value;
            var isProduction = host.Contains("the8.io");

            var team = isProduction 
                ? host.Split('.').First() 
                : httpContext.Request.Path.Value.Split('/')[1];

            httpContext.Items["Team"] = team;

            return _next(httpContext);
        }
    }
}
