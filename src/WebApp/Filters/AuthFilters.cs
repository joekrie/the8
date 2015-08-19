using System;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using TheEightSuite.WebApp.BusinessObjects.Teams;

namespace TheEightSuite.WebApp.Filters
{
    public class AuthenticationFilterAttribute : IAsyncAuthorizationFilter
    {
        private readonly TeamRole _role;

        public AuthenticationFilterAttribute(TeamRole role)
        {
            _role = role;
        }

        public Task OnAuthorizationAsync(AuthorizationContext context)
        {
            throw new NotImplementedException();
        }
    }
}
