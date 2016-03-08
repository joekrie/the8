using System.Collections.Generic;
using System.Threading.Tasks;
using NodaTime;
using TheEight.Common.Clubs;

namespace TheEight.WebApp.Repositories
{
    public interface IAccountsRepository
    {
        Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier);
        Task<SquadRoles> GetSquadMemberRoleForUser(int userId, int squadId);
        Task CreateSquadInvitesAsync(IEnumerable<string> emails, int squadId, SquadRoles roles,
            string accessCode, Instant created, Instant expiration);
    }
}