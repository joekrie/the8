using NodaTime;

namespace TheEight.Domain.Workouts
{
    public class Result
    {
        public string RowerId { get; set; }
        public Duration Split { get; set; }
    }
}