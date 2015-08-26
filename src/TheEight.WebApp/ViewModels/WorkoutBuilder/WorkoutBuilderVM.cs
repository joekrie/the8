using System.Collections.Generic;
using TheEight.Domain.WorkoutTracker;

namespace TheEight.WebApp.ViewModels.WorkoutBuilder
{
    public class WorkoutBuilderVM
    {
        public string WorkoutId { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public List<PieceInfo> Pieces { get; set; } = new List<PieceInfo>();
        public bool ForceSaveIfResults { get; set; }
    }
}