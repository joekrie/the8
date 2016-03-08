using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Http;
using TheEight.Common.Clubs;
using TheEight.WebApp.Constants;
using IAccountsRepository = TheEight.WebApp.Repositories.IAccountsRepository;

namespace TheEight.WebApp.Services.Authorization
{
    public class AuthorizationService : IAuthorizationService
    {
        private readonly IAccountsRepository _accountsRepository;

        public AuthorizationService(IAccountsRepository accountsRepository)
        {
            _accountsRepository = accountsRepository;
        }

        public int? GetActiveSquadIdFromRequest(HttpRequest request)
        {
            int squadId;
            var didParse = int.TryParse(request.Cookies[TheEightCookies.ActiveSquadId], out squadId);
            return didParse ? squadId : new int?();
        }

        private static int GetUserIdFromClaimsPrincipal(ClaimsPrincipal claimsPrincipal)
        {
            var userIdClaim = claimsPrincipal
                .FindFirst(claim => claim.Type == TheEightClaimTypes.UserId)
                .Value;

            var userId = int.Parse(userIdClaim);
            return userId;
        }

        public Task<ClubRoles> GetClubRoles(ClaimsPrincipal claimsPrincipal)
        {
            var userId = GetUserIdFromClaimsPrincipal(claimsPrincipal);
            return Task.FromResult(ClubRoles.Admin);
        }

        public async Task<bool> UserAuthorizedForSquad(int squadId)
        {
            var role = await _accountsRepository.GetSquadMemberRoleForUser(0, squadId);
            return role != SquadRoles.None;
        }
    }
}