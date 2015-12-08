using System.Linq;
using System.Security.Claims;
using Microsoft.AspNet.Authentication.OAuth;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.Extensions.OptionsModel;
using TheEight.Common.Authentication;
using TheEight.Common.OptionsModels;
using TheEight.WebApp.Services;
using Microsoft.Extensions.DependencyInjection;

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
                var oAuthService = app.ApplicationServices.GetRequiredService<OAuthService>();

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
                var oAuthService = app.ApplicationServices.GetRequiredService<OAuthService>();

                options.CallbackPath = "/facebook";
                options.AuthenticationScheme = AuthenticationSchemes.Facebook;

                options.ClientId = settings.OAuth.ClientId;
                options.ClientSecret = settings.OAuth.ClientSecret;

                ConfigureExternalAuth(options, oAuthService);
            });
        }

        private static void ConfigureExternalAuth(OAuthOptions options, OAuthService oAuthService)
        {
            options.SignInScheme = AuthenticationSchemes.Cookie;

            options.Events = new OAuthEvents
            {
                OnCreatingTicket = async context =>
                {
                    var loginIdentifier = context.Identity.Claims
                        .Single(c => c.Type == ClaimTypes.NameIdentifier)
                        .Value;

                    var identity = await oAuthService.CreateClaimsIdentityAsync(options.AuthenticationScheme, 
                        loginIdentifier);

                    context.Principal.AddIdentity(identity);
                }
            };
        }
    }
}