using System.Collections.Generic;
using TheEightSuite.Data.Models.Teams;
using TheEightSuite.Data.Models.WorkoutTracker;

namespace TheEightSuite.WebApp.ViewModels
{
    public class SubmitResultForTeamVM
    {
        public string WorkoutId { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public Dictionary<string, UserInfo> Rowers { get; set; }
        public List<Piece> Pieces { get; set; }
    }
}