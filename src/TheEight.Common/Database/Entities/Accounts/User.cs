using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TheEight.Common.Database.Entities.Teams;

namespace TheEight.Common.Database.Entities.Accounts
{
    public class User
    {
        public int UserId { get; set; }

        public int? UserAccountId { get; set; }
        public UserAccount UserAccount { get; set; }

        [Required] public string GivenName { get; set; }
        [Required] public string Surname { get; set; }

        [Required] public string Email { get; set; }

        public string CellPhone { get; set; }

        public List<ClubMember> ClubMembers { get; set; }
        
        public List<UserMessagingMethod> UserNotificationPreferences { get; set; }
    }
}