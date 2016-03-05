using System;
using Microsoft.AspNet.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using TheEight.Common.Clubs;
using TheEight.WebApp.Services.Authorization;

namespace TheEight.WebApp.Filters
{
    public class RestrictToSystemAdminsFilterAttribute : Attribute, IFilterFactory
    {
        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            var authService = serviceProvider.GetRequiredService<IAuthorizationService>();
            return new RestrictToRolesFilter(authService, ClubRoles.None, SquadRoles.None, true);
        }
    }
}