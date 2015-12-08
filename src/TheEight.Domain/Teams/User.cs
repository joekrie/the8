using System.Collections.Generic;
using System.Security.Claims;

//using System.Security.Claims;

namespace TheEight.Domain.Teams
{
    public class User
    {
        public string Id { get; set; }

        public string LoginProvider { get; set; }
        public string LoginIdentifier { get; set; }

        public bool IsAdmin { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string DisplayName => $"{FirstName} {LastName}";
        public string SortName => $"{LastName}, {FirstName}";
        
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}