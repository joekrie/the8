using System.Collections.Generic;

namespace TheEight.Domain.Practices
{
    public class Practice
    {
        public string Id { get; set; }
        public IList<Attendee> UnassignedAttendees { get; set; } = new List<Attendee>();
        public IList<PracticeBoat> Boats { get; set; } = new List<PracticeBoat>();
    }
}
