using System.Collections.Generic;

namespace TheEight.WebApp.Models.BoatLineupPlanner
{
    public class BoatLineupPlannerVM
    {
        public string GetUrl { get; set; }
        public string SaveUrl { get; set; }
    }

    public class Practice
    {
        public IList<Attendee> Attendees { get; set; }
        public IList<Boat> Boats { get; set; }
    }

    public class Attendee
    {
        public string Id { get; set; }
        public string SortName { get; set; }
        public string DisplayName { get; set; }
        public Placement Placement { get; set; }
    }

    public class Placement
    {
        public string BoatKey { get; set; }
        public string SeatPosition { get; set; }
    }

    public class Boat
    {
        public string Id { get; set; }
        public BoatType Type { get; set; }
    }

    public class BoatType
    {
        public string Title { get; set; }
        public int RowerCount { get; set; }
        public bool IsCoxed { get; set; }
    }
}
