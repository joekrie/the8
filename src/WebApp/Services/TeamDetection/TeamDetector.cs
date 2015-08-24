using Microsoft.AspNet.Http;

namespace TheEightSuite.WebApp.Services.TeamDetection
{
    public class TeamDetector
    {
        public string GetTeam(HttpContext httpContext)
        {
            return httpContext.Items["Team"].ToString();
        }
    }
}
