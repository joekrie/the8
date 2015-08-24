using NodaTime;
using TheEightSuite.Data.Models.WorkoutTracker;

namespace TheEightSuite.WebApp.ViewModels
{
    public class ResultVM
    {
        public PieceInfo PieceInfo { get; set; }
        public Duration Split { get; set; }
        public int StrokeRate { get; set; }
    }
}