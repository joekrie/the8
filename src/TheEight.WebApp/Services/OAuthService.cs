using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Authentication.OAuth;
using TheEight.Common.Authentication;
using TheEight.Common.Services;
using System.Linq;

namespace TheEight.WebApp.Services
{
    public class OAuthService
    {
        private readonly UserService _userService;

        public OAuthService(UserService userService)
        {
            _userService = userService;
        }

        public async Task<ClaimsIdentity> CreateClaimsIdentityAsync(string loginProvider, string loginIdentifier)
        {
            var user = await _userService.GetUserByLoginAsync(loginProvider, loginIdentifier);

            var identity = new ClaimsIdentity(
                new List<Claim>
                {
                    new Claim(UserClaimTypes.UserId, user.Id)
                });

            return identity;
        }
    }
}
