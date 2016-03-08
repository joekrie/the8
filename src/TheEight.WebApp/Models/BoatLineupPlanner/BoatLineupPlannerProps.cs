using System.Collections.Generic;

namespace TheEight.WebApp.Models.BoatLineupPlanner
{
    public class BoatLineupPlannerVM
    {
        public string GetUrl { get; set; }
        public string SaveUrl { get; set; }
    }

    public class WaterEventVM
    {
        public WaterEventSettingsVM Settings { get; set; }
        public IEnumerable<BoatVM> Boats { get; set; }
        public IEnumerable<AttendeeVM> Attendees { get; set; }
    }

    public class WaterEventSettingsVM
    {
        public bool AllowMultipleAssignments { get; set; }
    }

    public class BoatVM
    {
        public string BoatId { get; set; }
        public string Title { get; set; }
        public bool IsCoxed { get; set; }
        public int SeatCount { get; set; }
        public IDictionary<int, string> SeatAssignments { get; set; }
    }

    public class AttendeeVM
    {
        public string AttendeeId { get; set; }
        public string SortName { get; set; }
        public string DisplayName { get; set; }
        public Position Position { get; set; }
    }

    public enum Position
    {
        COXSWAIN,
        ROWER
    }
}
