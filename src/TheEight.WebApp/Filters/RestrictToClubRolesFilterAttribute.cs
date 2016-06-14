using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using TheEight.Common.Clubs;
using TheEight.WebApp.Services.Authorization;

namespace TheEight.WebApp.Filters
{
    public class RestrictToClubRolesFilterAttribute : Attribute, IFilterFactory
    {
        private readonly ClubRoles _clubRoles;

        public RestrictToClubRolesFilterAttribute(ClubRoles clubRoles)
        {
            _clubRoles = clubRoles;
        }

        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            var authService = serviceProvider.GetRequiredService<IAuthorizationService>();
            
            return new RestrictToRolesFilter(authService, _clubRoles, SquadRoles.None, false);
        }

        public bool IsReusable { get; } = true;
    }
}