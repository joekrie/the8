using System;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Filters;
using TheEight.Common.Clubs;

namespace TheEight.WebApp.Controllers
{
    [ServiceFilter(typeof (AuthorizationFilter))]
    public abstract class BaseController : Controller {}

    public class AuthorizationFilter : IAsyncAuthorizationFilter
    {
        public Task OnAuthorizationAsync(AuthorizationContext authContext)
        {
            var requireClubRoleAttr = authContext.ActionDescriptor.
        }
    }

    [AttributeUsage(AttributeTargets.Class)]
    public class RequireClubRoleAttribute : Attribute
    {
        public ClubRole ClubRole { get; }

        public RequireClubRoleAttribute(ClubRole clubRole)
        {
            ClubRole = clubRole;
        }
    }

    [AttributeUsage(AttributeTargets.Class)]
    public class RequireSquadRoleAttribute : Attribute
    {
        public SquadRole SquadRole { get; }

        public RequireSquadRoleAttribute(SquadRole squadRole)
        {
            SquadRole = squadRole;
        }
    }
}