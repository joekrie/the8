using Authy.Net;
using Microsoft.Extensions.OptionsModel;
using TheEight.Common.Infrastructure.Configuration.ExternalServices;

namespace TheEight.WebApp.Services.Authentication
{
    public class TwoFactorAuthenticationService : ITwoFactorAuthenticationService
    {
        private readonly AuthyClient _authyClient;

        public TwoFactorAuthenticationService(IOptions<AuthySettings> authySettings)
        {
            var authyKey = authySettings.Value.Key;
            _authyClient = new AuthyClient(authyKey);
        }

        
    }
}