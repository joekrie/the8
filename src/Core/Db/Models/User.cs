using System.ComponentModel;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public UserLogin UserLogin { get; set; }
        public RowerProfile RowerProfile { get; set; }
    }
}