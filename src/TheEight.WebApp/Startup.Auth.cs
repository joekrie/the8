using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TheEight.Options;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private const string CookieAuthScheme = "the8.auth";

        private static void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseCookieAuthentication(
                new CookieAuthenticationOptions
                {
                    AuthenticationScheme = CookieAuthScheme,
                    CookieName = "the8.auth",
                    LoginPath = new PathString("/login"),
                    LogoutPath = new PathString("/logout"),
                    AccessDeniedPath = new PathString("/login"),
                    ReturnUrlParameter = "next",
                    AutomaticAuthenticate = true,
                    AutomaticChallenge = true,
                    CookieHttpOnly = false,
                    Events = new CookieAuthenticationEvents
                    {
                        OnSigningIn = context =>
                        {
                            var claims = new List<Claim>
                            {
                                new Claim("", "")
                            };

                            var identity = new ClaimsIdentity(claims);
                            context.Principal.AddIdentity(identity);

                            return Task.CompletedTask;
                        }
                    }
                });
            
            var adSettings = app
                .ApplicationServices
                .GetRequiredService<IOptions<AzureActiveDirectoryOptions>>()
                .Value;

            app.UseOpenIdConnectAuthentication(
                new OpenIdConnectOptions
                {
                    SignInScheme = CookieAuthScheme,
                    ClientId = adSettings.ClientId,
                    ClientSecret = adSettings.ApplicationKey
                });
        }
    }
}