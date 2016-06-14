using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using TheEight.Common.Clubs;
using IAuthorizationService = TheEight.WebApp.Services.Authorization.IAuthorizationService;

namespace TheEight.WebApp.Filters
{
    public class RestrictToRolesFilter : IAsyncAuthorizationFilter
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly ClubRoles _clubRoles;
        private readonly SquadRoles _squadRoles;
        private readonly bool _onlySystemAdmin;

        public RestrictToRolesFilter(IAuthorizationService authorizationService, ClubRoles clubRoles, 
            SquadRoles squadRoles, bool onlySystemAdmin)
        {
            _authorizationService = authorizationService;
            _clubRoles = clubRoles;
            _squadRoles = squadRoles;
            _onlySystemAdmin = onlySystemAdmin;
        }

        public async Task OnAuthorizationAsync(AuthorizationContext context)
        {
            var claimsPrincipal = context.User;
            await Task.FromResult(0);
        }

        public Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            throw new System.NotImplementedException();
        }
    }
}