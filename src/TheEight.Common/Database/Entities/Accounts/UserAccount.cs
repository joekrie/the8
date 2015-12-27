using System.ComponentModel.DataAnnotations;

namespace TheEight.Common.Database.Entities.Accounts
{
    public class UserAccount
    {
        public int UserAccountId { get; set; }

        public int UserId { get; set; }

        public User User { get; set; }

        [Required]
        public AccountProvider AccountProvider { get; set; }

        [Required]
        public string AccountKey { get; set; }
    }
}