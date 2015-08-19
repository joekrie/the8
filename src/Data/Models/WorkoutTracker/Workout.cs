using System.Collections.Generic;
using TheEightSuite.WebApp.BusinessObjects.WorkoutTracker;

namespace TheEightSuite.Data.Models.WorkoutTracker
{
    public class Workout
    {
        public string Id { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public IList<Piece> Pieces { get; set; } = new List<Piece>();
    }
}