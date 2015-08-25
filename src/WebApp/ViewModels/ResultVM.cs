using NodaTime;
using TheEight.Domain.WorkoutTracker;

namespace TheEight.WebApp.ViewModels
{
    public class ResultVM
    {
        public PieceInfo PieceInfo { get; set; }
        public Duration Split { get; set; }
        public int StrokeRate { get; set; }
    }
}