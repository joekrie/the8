using System.Collections.Generic;

namespace TheEightSuite.BusinessLogic.WorkoutTracker.Models
{
    public class Workout
    {
        public Workout()
        {
            Pieces = new List<Piece>();
        }

        public string Id { get; set; }
        public WorkoutInfo WorkoutInfo { get; set; }
        public IList<Piece> Pieces { get; set; }
    }
}