using NodaTime;

namespace TheEightSuite.Domain.WorkoutTracker
{
    public class Result
    {
        public string RowerId { get; set; }
        public Duration Split { get; set; }
    }
}