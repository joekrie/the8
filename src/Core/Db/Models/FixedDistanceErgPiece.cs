using System.Collections.Generic;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class FixedDistanceErgPiece : IErgPiece
    {
        public int Meters { get; set; }
        public IList<ErgPieceResult> Results { get; set; }
    }
}