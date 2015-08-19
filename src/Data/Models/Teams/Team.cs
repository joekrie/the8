using System.Collections.Generic;
using NodaTime;

namespace TheEightSuite.WebApp.BusinessObjects.Teams
{
    public class Team
    {
        public string Id { get; set; }

        public string Name { get; set; }
        public Interval ActivePeriod { get; set; }

        public IList<string> RowerUserIds { get; set; } = new List<string>();
        public IList<string> CoachUserIds { get; set; } = new List<string>();
    }
}
