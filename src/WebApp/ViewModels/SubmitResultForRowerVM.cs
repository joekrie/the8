using System.Collections.Generic;
using TheEightSuite.Data.Models.Teams;
using TheEightSuite.Data.Models.WorkoutTracker;

namespace TheEightSuite.WebApp.ViewModels
{
    public class SubmitResultForRowerVM
    {
        public string WorkoutId { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public UserInfo Rower { get; set; }
        public List<ResultVM> Results { get; set; }
    }
}