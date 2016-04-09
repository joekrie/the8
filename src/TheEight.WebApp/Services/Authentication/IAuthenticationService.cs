using System.Security.Claims;
using System.Threading.Tasks;

namespace TheEight.WebApp.Services.Authentication
{
    public interface IAuthenticationService
    {
        Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier);
        int? GetUserIdFromClaimsIdentity(ClaimsIdentity identity);
    }
}