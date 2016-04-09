using System.Security.Claims;
using System.Threading.Tasks;

namespace TheEight.WebApp.Services.Authentication
{
    public class AuthenticationService : IAuthenticationService
    {
        public Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier)
        {
            throw new System.NotImplementedException();
        }

        public int? GetUserIdFromClaimsIdentity(ClaimsIdentity identity)
        {
            throw new System.NotImplementedException();
        }
    }
}