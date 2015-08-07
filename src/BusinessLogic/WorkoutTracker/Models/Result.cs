using NodaTime;

namespace TheEightSuite.BusinessLogic.WorkoutTracker.Models
{
    public class Result
    {
        public string RowerId { get; set; }
        public RowerInfo RowerInfo { get; set; }
        public Duration Split { get; set; }
    }
}