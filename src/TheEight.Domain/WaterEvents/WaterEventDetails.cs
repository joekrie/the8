using System;
using System.Collections.Generic;
using NodaTime;

namespace TheEight.Domain.WaterEvents
{
    public class WaterEventDetails
    {
        public Guid EventId { get; set; }
        public WaterEventMode Mode { get; set; }
        public LocalDate Date { get; set; }
        public LocalTime? Time { get; set; }
        public string Notes { get; set; }
    }

    public class WaterEvent
    {
        public WaterEventDetails Details { get; set; }
        public IEnumerable<Boat> Boats { get; set; }
        public IEnumerable<AttendeeDetails> Attendees { get; set; }
    }
}
