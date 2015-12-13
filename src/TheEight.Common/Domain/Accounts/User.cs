namespace TheEight.Common.Domain.Accounts
{
    public class User
    {
        public string Id { get; set; }

        public UserAccountInfo AccountInfo { get; set; }
        public UserProfileInfo ProfileInfo { get; set; }
        public UserContactInfo ContactInfo { get; set; }
    }
}