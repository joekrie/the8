using System;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using TheEight.Domain.Teams;

namespace TheEight.WebApp.Filters
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
