using NodaTime;
using TheEightSuite.WebApp.BusinessObjects.Teams;

namespace TheEightSuite.WebApp.BusinessObjects.WorkoutTracker
{
    public class Result
    {
        public string RowerId { get; set; }
        public UserInfo UserInfo { get; set; }
        public Duration Split { get; set; }
    }
}