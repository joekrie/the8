using System;
using Microsoft.AspNet.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using TheEight.Common.Clubs;
using TheEight.WebApp.Services.Authorization;

namespace TheEight.WebApp.Filters
{
    public class RestrictToSquadRolesFilterAttribute : Attribute, IFilterFactory
    {
        private readonly SquadRoles _squadRoles;

        public RestrictToSquadRolesFilterAttribute(SquadRoles squadRoles)
        {
            _squadRoles = squadRoles;
        }

        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            var authService = serviceProvider.GetRequiredService<IAuthorizationService>();

            return new RestrictToRolesFilter(authService, ClubRoles.None, _squadRoles, false);
        }
    }
}