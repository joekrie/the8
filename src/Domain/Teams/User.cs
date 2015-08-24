using System.Collections.Generic;

namespace TheEightSuite.Domain.Teams
{
    public class User
    {
        public string Id { get; set; }

        public IList<LoginAccount> LoginAccounts { get; set; } = new List<LoginAccount>();

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string Email { get; set; }
        public bool EmailMessagesEnabled { get; set; }

        public string SmsNumber { get; set; }
        public bool SmsMessagesEnabled { get; set; }

        public UserInfo GetUserInfo()
        {
            return new UserInfo
            {
                DisplayName = $"{FirstName} {LastName}",
                SortName = $"{LastName}, {FirstName}"
            };
        }
    }
}