using System;
using System.Collections.Generic;

namespace TheEight.Common.Database.Entities.ErgPractices
{
    public class Workout
    {
        public int WorkoutId { get; set; }

        public string Title { get; set; }
        public string Comments { get; set; }
        public DateTime Date { get; set; }

        public List<Piece> Pieces { get; set; }
    }
}