using System.Collections.Generic;
using TheEight.Domain.Teams;
using TheEight.Domain.WorkoutTracker;

namespace TheEight.WebApp.ViewModels
{
    public class SubmitResultForTeamVM
    {
        public string WorkoutId { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public Dictionary<string, UserInfo> Rowers { get; set; }
        public List<Piece> Pieces { get; set; }
    }
}