using System.Collections.Generic;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class ErgWorkout
    {
        public string Id { get; set; }
        public string TeamId { get; set; }
        public IList<IErgPiece> Pieces { get; set; } 
    }
}
