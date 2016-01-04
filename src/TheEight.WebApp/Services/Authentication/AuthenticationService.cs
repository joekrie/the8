using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TheEight.WebApp.Constants;
using TheEight.WebApp.Repositories.Accounts;

namespace TheEight.WebApp.Services.Authentication
{
    public class AuthenticationService : IAuthenticationService
    {    
        private readonly IAccountsRepository _accountsRepository;

        public AuthenticationService(IAccountsRepository accountsRepository)
        {
            _accountsRepository = accountsRepository;
        }

        public async Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier)
        {
            return await _accountsRepository.GetUserIdFromLoginAsync(authenticationScheme, loginIdentifier);
        }

        public int? GetUserIdFromClaimsIdentity(ClaimsIdentity identity)
        {
            var claimValue = identity
                .Claims
                .SingleOrDefault(c => c.Type == TheEightClaimTypes.UserId);

            if (claimValue != null)
            {
                int userId;
                var parsed = int.TryParse(claimValue.Value, out userId);

                if (parsed)
                {
                    return userId;
                }
            }

            return new int?();
        }
    }
}