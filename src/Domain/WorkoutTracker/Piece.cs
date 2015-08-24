using System.Collections.Generic;

namespace TheEightSuite.Domain.WorkoutTracker
{
    public class Piece
    {
        public PieceInfo PieceInfo { get; set; }
        public IList<Result> Results { get; set; } = new List<Result>();
    }
}