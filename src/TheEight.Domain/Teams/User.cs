using System.Collections.Generic;

namespace TheEight.Domain.Teams
{
    public class User
    {
        public string Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        
        public UserInfo UserInfo =>
            new UserInfo
            {
                DisplayName = $"{FirstName} {LastName}",
                SortName = $"{LastName}, {FirstName}"
            };
    }
}