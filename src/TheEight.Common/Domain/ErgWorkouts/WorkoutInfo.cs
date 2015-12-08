using NodaTime;

namespace TheEight.Common.Domain.ErgWorkouts
{
    public class WorkoutInfo
    {
        public string Title { get; set; }

        public string Comments { get; set; }
        public LocalDate Date { get; set; }
    }
}