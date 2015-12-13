namespace TheEight.Common.Domain.Accounts
{
    public class UserProfileInfo
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string DisplayName => $"{FirstName} {LastName}";
        public string SortName => $"{LastName}, {FirstName}";
    }
}