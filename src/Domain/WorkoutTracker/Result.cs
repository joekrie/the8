using NodaTime;

namespace TheEight.Domain.WorkoutTracker
{
    public class Result
    {
        public string RowerId { get; set; }
        public Duration Split { get; set; }
    }
}