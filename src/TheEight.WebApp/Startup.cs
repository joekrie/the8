using Microsoft.AspNet.Builder;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;
using React.AspNet;
using System;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Hosting;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.Configuration;
using TheEight.Common.Config;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.OptionsModel;
using Microsoft.Extensions.PlatformAbstractions;
using TheEight.Common;
using TheEight.Common.Raven;

namespace TheEight.WebApp
{
    public class Startup
    {
        private readonly IConfiguration _config;
        private readonly bool _isDevelopment;

        public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(appEnv.ApplicationBasePath)
                .AddEnvironmentVariables();

            _isDevelopment = env.IsDevelopment();

            if (_isDevelopment)
            {
                builder.AddUserSecrets();
            }
            
            _config = builder.Build();
        }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();

            services.Configure<GoogleSettings>(_config.GetSection("Google"));
            services.Configure<RavenSettings>(_config.GetSection("Raven"));

            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IOptions<RavenSettings>>();
                return DocumentStoreFactory.CreateAndInitialize(settings.Value);
            });

            services.AddMvc()
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                    options.SerializerSettings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                })
                .AddMvcOptions(options =>
                {
                    if (!_isDevelopment)
                    {
                        options.Filters.Add(new RequireHttpsAttribute());
                    }
                });

            services.AddReact();

            return services.BuildServiceProvider();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseDeveloperExceptionPage();

            const string cookieAuthScheme = "the8-auth-cookie";

            app.UseCookieAuthentication(options =>
            {
                options.AuthenticationScheme = cookieAuthScheme;
                options.CookieName = cookieAuthScheme;
                options.LoginPath = new PathString("/login");
                options.LogoutPath = new PathString("/logout");
                options.ReturnUrlParameter = "next";
                options.AutomaticAuthenticate = true;
            });
            
            app.UseGoogleAuthentication(options =>
            {
                options.CallbackPath = "/google";
                options.AuthenticationScheme = "google";
                options.SignInScheme = cookieAuthScheme;

                options.ClientId = "687186987154-tnt0pqj5661jf91317jndtjp6ec2n3pq.apps.googleusercontent.com";
                options.ClientSecret = "9DgbfWF8KpobZxzVVGw8H6Au";

                options.Scope.Clear();
                options.Scope.Add("openid");
            });

            app.UseReact(config =>
            {
                config
                    .SetLoadBabel(false)
                    .SetLoadReact(false)
                    .AddScriptWithoutTransform("~/app/server.js");
            });

            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}