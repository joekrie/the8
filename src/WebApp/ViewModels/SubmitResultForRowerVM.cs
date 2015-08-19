using System.Collections.Generic;
using TheEightSuite.Data.Models.WorkoutTracker;
using TheEightSuite.WebApp.BusinessObjects.Teams;
using TheEightSuite.WebApp.BusinessObjects.WorkoutTracker;

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