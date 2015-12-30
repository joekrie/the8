using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace TheEight.Common.DataAccess.Accounts
{
    public class AccountsRepository : IAccountsRepository
    {
        private readonly IDbConnection _dbConn;
        public AccountsRepository(IDbConnection dbConn)
        {
            _dbConn = dbConn;
        }

        public async Task<string> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier)
        {
            var storedProcParams = new
            {
                LoginProvider = authenticationScheme,
                Identifier = loginIdentifier
            };

            var user = await _dbConn.QueryAsync("[Accounts].[GetUserIdByLogin]", storedProcParams, 
                commandType: CommandType.StoredProcedure);

            return user.Single().UserId;
        }
    }
}