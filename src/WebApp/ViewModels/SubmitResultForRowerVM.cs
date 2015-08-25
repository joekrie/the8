using System.Collections.Generic;
using TheEight.Domain.Teams;
using TheEight.Domain.WorkoutTracker;

namespace TheEight.WebApp.ViewModels
{
    public class SubmitResultForRowerVM
    {
        public string WorkoutId { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public UserInfo Rower { get; set; }
        public List<ResultVM> Results { get; set; }
    }
}