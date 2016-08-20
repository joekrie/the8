using System;

namespace TheEight.Domain.WaterEvents
{
    public class AttendeeDetails
    {
        public Guid AttendeeId { get; set; }
        public string SortName { get; set; }
        public string DisplayName { get; set; }
    }
}