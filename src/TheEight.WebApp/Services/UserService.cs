using System;
using System.Threading.Tasks;
using Raven.Client;
using TheEight.Common.Database.Entities.Accounts;
using TheEight.Common.RavenDb.Indexes;

namespace TheEight.WebApp.Services
{
    public class UserService
    {
        private readonly IAsyncDocumentSession _ravenSession;

        public UserService(IAsyncDocumentSession ravenSession)
        {
            _ravenSession = ravenSession;
        }

        public async Task<User> GetUserByLoginAsync(string loginProvider, string loginIdentifier)
        {
            var user = await _ravenSession
                .Query<User>(UserByLoginIndex.Name)
                .SingleOrDefaultAsync(u => u.AccountInfo.LoginProvider == loginProvider
                                           && u.AccountInfo.LoginIdentifier == loginIdentifier);

            if (user == null)
            {
                throw new UserNotFoundByLoginException(loginProvider, loginIdentifier);
            }

            return user;
        }

        public class UserNotFoundByLoginException : Exception
        {
            private static string ErrorMessage(string loginProvider, string loginIdentifier) =>
                $"Could not find user by login in database with provider {loginProvider} and identifier {loginIdentifier}";

            public UserNotFoundByLoginException(string loginProvider, string loginIdentifier)
                : base(ErrorMessage(loginProvider, loginIdentifier))
            { }
        }
    }
}
