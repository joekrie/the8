using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNet.Authentication.OAuth;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using TheEight.Common.Configuration;
using TheEight.Common.DataAccess.Accounts;
using TheEight.WebApp.Authentication;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseCookieAuthentication(options =>
            {
                options.AuthenticationScheme = AuthenticationSchemes.Cookie;
                options.CookieName = AuthenticationSchemes.Cookie;

                options.LoginPath = new PathString("/login");
                options.LogoutPath = new PathString("/logout");

                options.ReturnUrlParameter = "next";
                options.AutomaticAuthenticate = true;
            });

            app.UseGoogleAuthentication(options =>
            {
                var settings = app.ApplicationServices.GetRequiredService<IOptions<GoogleSettings>>().Value;
                var oAuthService = app.ApplicationServices.GetRequiredService<IAccountsRepository>();

                options.CallbackPath = "/google";
                options.AuthenticationScheme = AuthenticationSchemes.Google;

                options.ClientId = settings.OAuth.ClientId;
                options.ClientSecret = settings.OAuth.ClientSecret;

                options.Scope.Clear();
                options.Scope.Add("openid");

                ConfigureExternalAuth(options, oAuthService);
            });

            app.UseFacebookAuthentication(options =>
            {
                var settings = app.ApplicationServices.GetRequiredService<IOptions<FacebookSettings>>().Value;
                var oAuthService = app.ApplicationServices.GetRequiredService<IAccountsRepository>();

                options.CallbackPath = "/facebook";
                options.AuthenticationScheme = AuthenticationSchemes.Facebook;

                options.ClientId = settings.OAuth.ClientId;
                options.ClientSecret = settings.OAuth.ClientSecret;

                ConfigureExternalAuth(options, oAuthService);
            });
        }

        private static void ConfigureExternalAuth(OAuthOptions options, IAccountsRepository oAuthService)
        {
            options.SignInScheme = AuthenticationSchemes.Cookie;

            options.Events = new OAuthEvents
            {
                OnCreatingTicket = async context =>
                {
                    var loginIdentifier = context.Identity.Claims
                        .Single(c => c.Type == ClaimTypes.NameIdentifier)
                        .Value;

                    var userId = await oAuthService.GetUserIdFromLoginAsync(options.AuthenticationScheme, loginIdentifier);

                    var claims = new List<Claim>
                    {
                        new Claim(UserClaimTypes.UserId, userId)
                    };

                    var identity = new ClaimsIdentity(claims);
                    context.Principal.AddIdentity(identity);
                }
            };
        }
    }
}