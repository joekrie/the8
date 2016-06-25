using System;
using NodaTime;

namespace TheEight.Domain.WaterEvents
{
    public class WaterEvent
    {
        public Guid EventId { get; set; }
        public WaterEventMode Mode { get; set; }
        public LocalDate Date { get; set; }
        public LocalTime? Time { get; set; }
        public string Notes { get; set; }
    }
}
