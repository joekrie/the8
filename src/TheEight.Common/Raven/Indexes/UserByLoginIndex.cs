using System.Linq;
using Raven.Client.Indexes;
using TheEight.Common.Domain.Teams;

namespace TheEight.Common.Raven.Indexes
{
    public class UserByLoginIndex : AbstractIndexCreationTask<User>
    {
        public const string Name = "User/ByLogin";

        public UserByLoginIndex()
        {
            Map = users => users.Select(u => new
            {
                u.LoginProvider,
                u.LoginIdentifier
            });
        }

        public override string IndexName => Name;
    }
}
