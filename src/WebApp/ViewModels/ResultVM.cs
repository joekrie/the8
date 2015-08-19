using NodaTime;
using TheEightSuite.Data.Models.WorkoutTracker;
using TheEightSuite.WebApp.BusinessObjects.WorkoutTracker;

namespace TheEightSuite.WebApp.ViewModels
{
    public class ResultVM
    {
        public PieceInfo PieceInfo { get; set; }
        public Duration Split { get; set; }
        public int StrokeRate { get; set; }
    }
}