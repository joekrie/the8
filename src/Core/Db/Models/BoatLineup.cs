using System.Collections.Generic;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class BoatLineup
    {
        public IBoat Boat { get; set; }
        public IList<string> UserIds { get; set; } 
    }
}