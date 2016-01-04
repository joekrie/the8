using System.Collections.Generic;
using System.Threading.Tasks;
using NodaTime;
using TheEight.Common.Domain.Clubs;

namespace TheEight.WebApp.Repositories.Accounts
{
    public interface IAccountsRepository
    {
        Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier);
        Task<SquadMemberRole> GetSquadMemberRoleForUser(int userId, int squadId);
        
        Task CreateSquadInvitesAsync(IEnumerable<string> emails, int squadId, SquadMemberRole role,
            string accessCode, Instant created, Instant expiration);
    }
}