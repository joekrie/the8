using System.Collections.Generic;
using NodaTime;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class FixedDurationErgPiece : IErgPiece
    {
        public Duration Duration { get; set; }
        public IList<ErgPieceResult> Results { get; set; }
    }
}