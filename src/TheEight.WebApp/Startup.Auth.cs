using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNet.Authentication.OAuth;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using TheEight.Common.Infrastructure.Configuration.Security;
using TheEight.WebApp.Constants;
using TheEight.WebApp.Services.Authentication;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseCookieAuthentication(options =>
            {
                options.AuthenticationScheme = TheEightAuthenticationSchemes.Cookie;
                options.CookieName = TheEightCookies.Authentication;

                options.LoginPath = new PathString("/login");
                options.LogoutPath = new PathString("/logout");

                options.ReturnUrlParameter = "next";
                options.AutomaticAuthenticate = true;
            });

            app.UseGoogleAuthentication(options =>
            {
                var settings = app
                    .ApplicationServices
                    .GetRequiredService<IOptions<GoogleSettings>>()
                    .Value;

                var authService = app
                    .ApplicationServices
                    .GetRequiredService<IAuthenticationService>();

                options.CallbackPath = "/authgoogle";
                options.AuthenticationScheme = TheEightAuthenticationSchemes.Google;

                options.ClientId = settings.OAuth.ClientId;
                options.ClientSecret = settings.OAuth.ClientSecret;

                options.Scope.Clear();
                options.Scope.Add("openid");

                ConfigureExternalAuth(options, authService);
            });

            app.UseFacebookAuthentication(options =>
            {
                var settings = app
                    .ApplicationServices
                    .GetRequiredService<IOptions<FacebookSettings>>()
                    .Value;

                var authService = app
                    .ApplicationServices
                    .GetRequiredService<IAuthenticationService>();

                options.CallbackPath = "/authfacebook";
                options.AuthenticationScheme = TheEightAuthenticationSchemes.Facebook;

                options.ClientId = settings.OAuth.ClientId;
                options.ClientSecret = settings.OAuth.ClientSecret;

                ConfigureExternalAuth(options, authService);
            });
        }

        private static void ConfigureExternalAuth(OAuthOptions options, IAuthenticationService authService)
        {
            options.SignInScheme = TheEightAuthenticationSchemes.Cookie;

            options.Events = new OAuthEvents
            {
                OnCreatingTicket = async context =>
                {
                    var loginIdentifier = context
                        .Identity
                        .Claims
                        .Single(c => c.Type == ClaimTypes.NameIdentifier)
                        .Value;

                    var userId = await authService.GetUserIdFromLoginAsync(options.AuthenticationScheme, loginIdentifier);

                    var claims = new List<Claim>
                    {
                        new Claim(TheEightClaimTypes.UserId, userId.ToString(), ClaimValueTypes.Integer)
                    };

                    var identity = new ClaimsIdentity(claims);
                    context.Principal.AddIdentity(identity);
                }
            };
        }
    }
}