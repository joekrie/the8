using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using NodaTime;
using TheEight.Common.Domain.Clubs;
using TheEight.WebApp.Repositories.Accounts;
using System.Linq;
using Autofac.Extras.AttributeMetadata;

namespace TheEight.WebApp.Services.Invites
{
    public class InviteService : IInviteService
    {
        private readonly IAccountsRepository _repository;
        private readonly Func<string> _generateAccessCode;
        private readonly IClock _clock;

        public InviteService(IAccountsRepository repository, IClock clock,
            [WithKey(AccessCodeGenerator.ServiceName)] Func<string> generateAccessCode)
        {
            _repository = repository;
            _clock = clock;
            _generateAccessCode = generateAccessCode;
        }

        public async Task InviteUsersToSquadAsync(IEnumerable<string> emails, int squadId, SquadMemberRole role)
        {
            var created = _clock.Now;
            var expiration = created + Duration.FromStandardDays(4);

            var accessCode = _generateAccessCode();
            
            await _repository.CreateSquadInvitesAsync(emails, squadId, role, accessCode, created, expiration);
        }

        public ClaimsDerivedInfo DeriveInfoFromClaims(ClaimsIdentity identity)
        {
            var claims = identity
                .Claims
                .ToList();

            var info = new ClaimsDerivedInfo
            {
                GivenName = GetClaimValue(claims, ClaimTypes.GivenName),
                Surname = GetClaimValue(claims, ClaimTypes.GivenName),
                Email = GetClaimValue(claims, ClaimTypes.Email)
            };
            
            return info;
        }

        private static string GetClaimValue(IEnumerable<Claim> claims, string claimType)
        {
            return claims
                .SingleOrDefault(c => c.Type == claimType)
                ?.Value;
        }
    }
}