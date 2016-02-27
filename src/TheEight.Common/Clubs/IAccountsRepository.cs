using System.Collections.Generic;
using System.Threading.Tasks;
using NodaTime;

namespace TheEight.Common.Clubs
{
    public interface IAccountsRepository
    {
        Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier);
        Task<SquadRole> GetSquadMemberRoleForUser(int userId, int squadId);
        
        Task CreateSquadInvitesAsync(IEnumerable<string> emails, int squadId, SquadRole role,
            string accessCode, Instant created, Instant expiration);
    }
}