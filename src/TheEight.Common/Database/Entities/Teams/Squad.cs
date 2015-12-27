using System;
using System.Collections.Generic;
using NodaTime;

namespace TheEight.Common.Database.Entities.Teams
{
    public class Squad
    {
        public int SquadId { get; set; }

        public int ClubId { get; set; }
        public Club Club { get; set; }

        public string Name { get; set; }

        public DateTime Start { get; set; }
        public DateTime End { get; set; }

        public List<SquadMember> SquadMembers { get; set; }
    }
}
