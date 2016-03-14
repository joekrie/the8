using System.Threading.Tasks;
using Microsoft.AspNet.Mvc.Filters;
using TheEight.Common.Clubs;
using TheEight.WebApp.Services.Authorization;

namespace TheEight.WebApp.Filters
{
    public class RequireTwoFactorAuthenticationFilter : IAsyncAuthorizationFilter
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly ClubRoles _clubRoles;
        private readonly SquadRoles _squadRoles;
        private readonly bool _onlySystemAdmin;

        public RequireTwoFactorAuthenticationFilter(IAuthorizationService authorizationService, ClubRoles clubRoles, 
            SquadRoles squadRoles, bool onlySystemAdmin)
        {
            _authorizationService = authorizationService;
            _clubRoles = clubRoles;
            _squadRoles = squadRoles;
            _onlySystemAdmin = onlySystemAdmin;
        }

        public async Task OnAuthorizationAsync(AuthorizationContext context)
        {
            var claimsPrincipal = context.HttpContext.User;
            await Task.FromResult(0);
        }
    }
}