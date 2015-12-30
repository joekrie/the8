using System.Threading.Tasks;

namespace TheEight.Common.DataAccess.Accounts
{
    public interface IAccountsRepository
    {
        Task<string> GetUserIdFromLoginAsync(string authenticationScheme, string loginIdentifier);
    }
}