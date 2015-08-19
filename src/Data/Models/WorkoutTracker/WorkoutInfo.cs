using NodaTime;

namespace TheEightSuite.Data.Models.WorkoutTracker
{
    public class WorkoutInfo
    {
        public string Title { get; set; }

        public string Comments { get; set; }
        public LocalDate Date { get; set; }
    }
}