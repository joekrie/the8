using System.Collections.Generic;
using TheEight.Common.Domain.WaterEvents;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public class WaterEvent
    {
        public int WaterEventId { get; set; }

        public WaterEventMode Mode { get; set; }

        public List<WaterEventAttendee> WaterPracticeAttendees { get; set; }
        public List<WaterEventBoat> WaterPracticeBoats { get; set; }
    }
}
