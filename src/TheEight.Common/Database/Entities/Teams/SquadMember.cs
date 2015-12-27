using System.Collections.Generic;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Metadata.Builders;
using TheEight.Common.Database.Entities.WaterEvents;

namespace TheEight.Common.Database.Entities.Teams
{
    public class SquadMember
    {
        public int SquadMemberId { get; set; }
        
        public SquadRole Role { get; set; }
        
        public int ClubMemberId { get; set; }
        public ClubMember ClubMember { get; set; }

        public int SquadId { get; set; }
        public Squad Squad { get; set; }

        public List<SquadMemberWaterEventAttendee> SquadMemberWaterEventAttendees { get; set; }

        internal static void BuildEntityType(EntityTypeBuilder<SquadMember> entityBuilder)
        {
            entityBuilder
                .HasOne(sm => sm.ClubMember)
                .WithMany(cm => cm.SquadMembers)
                .HasForeignKey(sm => sm.ClubMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            entityBuilder
                .HasOne(sm => sm.Squad)
                .WithMany(s => s.SquadMembers)
                .HasForeignKey(sm => sm.SquadId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}