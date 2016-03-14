using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using NodaTime;
using System.Linq;
using TheEight.Common.Clubs;

//namespace TheEight.WebApp.Services.Invites
//{
//    public class InviteService : IInviteService
//    {
//        private readonly IAccountsRepository _repository;
//        private readonly Func<string> _generateAccessCode;
//        private readonly IClock _clock;

//        public InviteService(IAccountsRepository repository, IClock clock,
//            IAccessCodeGenerator accessCodeGenerator)
//        {
//            _repository = repository;
//            _clock = clock;
//            _generateAccessCode = accessCodeGenerator.GenerateCode;
//        }

//        public async Task InviteUsersToSquadAsync(IEnumerable<string> emails, int squadId, SquadRoles roles)
//        {
//            var created = _clock.Now;
//            var expiration = created + Duration.FromStandardDays(4);

//            var accessCode = _generateAccessCode();
            
//            await _repository.CreateSquadInvitesAsync(emails, squadId, roles, accessCode, created, expiration);
//        }

//        public ClaimsDerivedInfo DeriveInfoFromClaims(ClaimsIdentity identity)
//        {
//            var claims = identity
//                .Claims
//                .ToList();

//            var info = new ClaimsDerivedInfo
//            {
//                GivenName = GetClaimValue(claims, ClaimTypes.GivenName),
//                Surname = GetClaimValue(claims, ClaimTypes.GivenName),
//                Email = GetClaimValue(claims, ClaimTypes.Email)
//            };
            
//            return info;
//        }

//        private static string GetClaimValue(IEnumerable<Claim> claims, string claimType)
//        {
//            return claims
//                .SingleOrDefault(c => c.Type == claimType)
//                ?.Value;
//        }
//    }
//}