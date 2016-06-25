using System;

namespace TheEight.Domain.WaterEvents
{
    public class Boat
    {
        public Guid BoatId { get; set; }
        public string Title { get; set; }
        public int SeatCount { get; set; }
        public bool IsCoxed { get; set; }
    }
}