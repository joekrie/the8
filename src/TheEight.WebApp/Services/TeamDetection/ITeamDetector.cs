using Microsoft.AspNet.Http;

namespace TheEight.WebApp.Services.TeamDetection
{
    public interface ITeamDetector
    {
        string GetTeam(HttpContext httpContext);
    }
}