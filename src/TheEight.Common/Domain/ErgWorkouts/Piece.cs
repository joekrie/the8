using System.Collections.Generic;

namespace TheEight.Common.Domain.ErgWorkouts
{
    public class Piece
    {
        public IDictionary<string, Split> SplitsByRowerId { get; set; } = new Dictionary<string, Split>();
        public PieceMagnitude Magnitude { get; set; }
    }
}