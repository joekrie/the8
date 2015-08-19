using System.Collections.Generic;
using TheEightSuite.Data.Models.WorkoutTracker;

namespace TheEightSuite.WebApp.BusinessObjects.WorkoutTracker
{
    public class Piece
    {
        public PieceInfo PieceInfo { get; set; }
        public IList<Result> Results { get; set; } = new List<Result>();
    }
}