using Raven.Client.Indexes;
using System.Linq;
using TheEight.Common.Domain.Accounts;

namespace TheEight.Common.RavenDb.Indexes
{
    public class UserByLoginIndex : AbstractIndexCreationTask<User>
    {
        public const string Name = "User/ByLogin";
        public override string IndexName => Name;

        public UserByLoginIndex()
        {
            Map = users => users.Select(u => new
            {
                u.AccountInfo.LoginProvider,
                u.AccountInfo.LoginIdentifier
            });
        }
    }
}
