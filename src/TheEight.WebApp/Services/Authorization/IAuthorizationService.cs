using System.Threading.Tasks;
using Microsoft.AspNet.Http;

namespace TheEight.WebApp.Services.Authorization
{
    public interface IAuthorizationService
    {
        int? GetActiveSquadIdFromRequest(HttpRequest request);
    }
}