using System.Threading.Tasks;
using Microsoft.AspNet.Mvc.Filters;
using TheEight.Common.Clubs;

namespace TheEight.WebApp.Filters
{
    public class SquadRoleAuthorizationFilterAttribute : AuthorizationFilterAttribute
    {
        private readonly SquadRole _squadRole;

        public SquadRoleAuthorizationFilterAttribute(SquadRole squadRole)
        {
            _squadRole = squadRole;
        }

        public override async Task OnAuthorizationAsync(AuthorizationContext authContext)
        {
            var claimsPrincipal = authContext.HttpContext.User;
            //var user = 

            await Task.FromResult(0);
        }
    }
}