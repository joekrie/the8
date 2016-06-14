using System.Collections.Generic;

namespace TheEight.WebApp.Models.BoatLineupPlanner
{
    public class WaterEventVM
    {
        public WaterEventSettingsVM Settings { get; set; }
        public IEnumerable<BoatVM> Boats { get; set; }
        public IEnumerable<AttendeeVM> Attendees { get; set; }
    }
}