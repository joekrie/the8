using Microsoft.AspNet.Http;
using System.Linq;
using Microsoft.AspNet.Routing;
using System;
using System.Threading.Tasks;

namespace TheEight.WebApp.Services.TeamDetection
{
    public class SubdomainTeamDetector : ITeamDetector
    {
        public string GetTeam(HttpContext httpContext)
        {
            return httpContext.Request.Host.Value.Split('.').First();
        }
    }

    public class MyRoute : IRouter
    {
        public VirtualPathData GetVirtualPath(VirtualPathContext context)
        {
            throw new NotImplementedException();
        }

        public Task RouteAsync(RouteContext context)
        {
            throw new NotImplementedException();
        }
    }
}
