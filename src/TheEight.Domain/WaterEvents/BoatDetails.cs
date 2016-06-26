using System;
using System.Collections.Generic;

namespace TheEight.Domain.WaterEvents
{
    public class BoatDetails
    {
        public Guid BoatId { get; set; }
        public string Title { get; set; }
        public int SeatCount { get; set; }
        public bool IsCoxed { get; set; }
    }

    public class Boat
    {
        public BoatDetails Details { get; set; }
        public IDictionary<int, Guid> AssignedSeats { get; set; }
    }
}