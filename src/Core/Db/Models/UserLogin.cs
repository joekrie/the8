namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class UserLogin
    {
        public LoginProvider LoginProvider { get; set; }
        public string UserIdentifier { get; set; }
    }
}
