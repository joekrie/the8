using System;

namespace TheEight.Domain.WaterEvents
{
    public class Attendee
    {
        public Guid AttendeeId { get; set; }
        public string SortName { get; set; }
        public string DisplayName { get; set; }
    }
}