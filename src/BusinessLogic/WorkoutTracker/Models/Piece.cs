using System.Collections.Generic;

namespace TheEightSuite.BusinessLogic.WorkoutTracker.Models
{
    public class Piece
    {
        public Piece()
        {
            Results = new List<Result>();
        }

        public PieceInfo PieceInfo { get; set; }
        public IList<Result> Results { get; set; }
    }
}