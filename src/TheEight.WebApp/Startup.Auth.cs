using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using TheEight.Options;

namespace TheEight.WebApp
{
    public partial class Startup
    {
        private const string CookieAuthScheme = "cookie";

        private static void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseCookieAuthentication(options =>
            {
                options.AuthenticationScheme = CookieAuthScheme;
                options.CookieName = "the8.auth";

                options.LoginPath = new PathString("/login");
                options.LogoutPath = new PathString("/logout");

                options.ReturnUrlParameter = "next";
                options.AutomaticAuthenticate = true;
            });

            app.UseOpenIdConnectAuthentication(options =>
            {
                var settings = app.ApplicationServices.GetRequiredService<IOptions<AzureActiveDirectoryOptions>>().Value;

                options.SignInScheme = CookieAuthScheme;
                options.ClientId = settings.ClientId;
                options.ClientSecret = settings.ApplicationKey;
            });
        }
    }
}