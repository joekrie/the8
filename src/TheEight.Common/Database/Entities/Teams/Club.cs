using System.Collections.Generic;
using TheEight.Common.Database.Entities.WaterEvents;

namespace TheEight.Common.Database.Entities.Teams
{
    public class Club
    {
        public int ClubId { get; set; }

        public string Name { get; set; }

        public List<ClubMember> ClubMembers { get; set; }
        public List<Squad> Squads { get; set; } 
        public List<ClubBoat> ClubBoats { get; set; } 
    }
}