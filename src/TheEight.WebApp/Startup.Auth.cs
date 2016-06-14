using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using TheEight.Options;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private const string CookieAuthScheme = "cookie";

        private static void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseCookieAuthentication(
                new CookieAuthenticationOptions
                {
                    AuthenticationScheme = CookieAuthScheme,
                    CookieName = "the8.auth",
                    LoginPath = new PathString("/login"),
                    LogoutPath = new PathString("/logout"),
                    ReturnUrlParameter = "next",
                    AutomaticAuthenticate = true
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