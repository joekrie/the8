using System.Collections.Generic;

namespace TheEight.WebApp.Models.BoatLineupPlanner
{
    public class BoatVM
    {
        public string BoatId { get; set; }
        public string Title { get; set; }
        public bool IsCoxed { get; set; }
        public int SeatCount { get; set; }
        public IDictionary<int, string> SeatAssignments { get; set; }
    }
}