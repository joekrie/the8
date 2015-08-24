using NodaTime;

namespace TheEightSuite.Domain.WorkoutTracker
{
    public class WorkoutInfo
    {
        public string Title { get; set; }

        public string Comments { get; set; }
        public LocalDate Date { get; set; }
    }
}