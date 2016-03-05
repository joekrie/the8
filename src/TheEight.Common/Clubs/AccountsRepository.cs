using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using NodaTime;

namespace TheEight.Common.Clubs
{
    public class AccountsRepository : IAccountsRepository
    {
        private readonly IDbConnection _dbConn;

        public AccountsRepository(IDbConnection dbConn)
        {
            _dbConn = dbConn;
        }

        public async Task<int> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier)
        {
            const string sqlCmd =
                "SELECT UserId " +
                "FROM Accounts.Logins " +
                "WHERE LoginProviderId = @LoginProviderId " +
                "   AND LoginIdentifier = @LoginIdentifier";

            var sqlParams = new
            {
                LoginProviderId = authenticationScheme,
                LoginIdentifier = loginIdentifier
            };

            var userId = await _dbConn.QuerySingleAsync<int>(sqlCmd, sqlParams);
            return userId;
        }

        public async Task CreateSquadInvitesAsync(IEnumerable<string> emails, int squadId, SquadRoles roles,
            string accessCode, Instant created, Instant expiration)
        {
            const string sqlCmd =
                "DECLARE @InviteOutput TABLE (InviteId INT) " +
                "INSERT INTO Accounts.Invites (AccessCode, Created, Expiration, Email) " +
                "   OUTPUT INSERTED.InviteId INTO @InviteOutput " +
                "   VALUES (@AccessCode, @Created, @Expiration, @Email) " +
                "INSERT INTO Accounts.SquadInvites (InviteId, SquadId, SquadMemberRoleId) " +
                "   ((SELECT InviteId FROM @InviteOutput), @SquadId, @SquadMemberRoleId)";

            var sqlParams = emails.Select(e => new
            {
                Email = e,
                SquadId = squadId,
                SquadMemberRoleId = roles,
                AccessCode = accessCode,
                Created = created,
                Expiration = expiration
            });

            await _dbConn.ExecuteAsync(sqlCmd, sqlParams);
        }

        public async Task<SquadRoles> GetSquadMemberRoleForUser(int userId, int squadId)
        {
            const string sqlCmd =
                "SELECT SquadMemberRoleId " +
                "FROM Clubs.SquadMembers " +
                "WHERE UserId = @UserId " +
                "   AND SquadId = @SquadId";

            var sqlParams = new
            {
                UserId = userId,
                SquadId = squadId
            };

            var role = await _dbConn.QuerySingleOrDefaultAsync<SquadRoles>(sqlCmd, sqlParams);
            return role;
        }
    }
}