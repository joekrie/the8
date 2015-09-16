using System.Collections.Generic;

namespace TheEight.Domain.Workouts
{
    public class Piece
    {
        public PieceInfo PieceInfo { get; set; }
        public IList<Result> Results { get; set; } = new List<Result>();
    }
}