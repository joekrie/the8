using System.Collections.Generic;

namespace TheEight.Domain.WorkoutTracker
{
    public class Piece
    {
        public PieceInfo PieceInfo { get; set; }
        public IList<Result> Results { get; set; } = new List<Result>();
    }
}