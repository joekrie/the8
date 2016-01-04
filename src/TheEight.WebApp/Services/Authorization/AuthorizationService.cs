using System.Threading.Tasks;
using Microsoft.AspNet.Http;
using TheEight.Common.Domain.Clubs;
using TheEight.WebApp.Constants;
using TheEight.WebApp.Repositories.Accounts;

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

        public async Task<bool> UserAuthorizedForSquad(int squadId)
        {
            var role = await _accountsRepository.GetSquadMemberRoleForUser(0, squadId);
            return role != SquadMemberRole.None;
        }
    }
}