using System.Collections.Generic;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class TeamPractices
    {
        public string Id { get; set; }
        public string TeamId { get; set; }
        public int Year { get; set; }
        public IList<Practice> Practices { get; set; }
    }
}