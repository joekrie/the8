using System.Collections.Generic;
using NodaTime;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class Team
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public LocalDate? ActiveStart { get; set; }
        public LocalDate? ActiveEnd { get; set; }
        public string HeadCoachUserId { get; set; }
        public IList<string> AssistantCoachUserIds { get; set; }
        public IList<string> RowerUserIds { get; set; }
    }
}