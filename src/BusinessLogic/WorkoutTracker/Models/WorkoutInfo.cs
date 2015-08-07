using NodaTime;

namespace TheEightSuite.BusinessLogic.WorkoutTracker.Models
{
    public class WorkoutInfo
    {
        public string Title { get; set; }
        public string Comments { get; set; }
        public LocalDate Date { get; set; }
    }
}