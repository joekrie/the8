namespace TheEight.Common.Domain.Accounts
{
    public class UserAccountInfo
    {
        public string LoginProvider { get; set; }
        public string LoginIdentifier { get; set; }
        public bool IsAdmin { get; set; }
    }
}