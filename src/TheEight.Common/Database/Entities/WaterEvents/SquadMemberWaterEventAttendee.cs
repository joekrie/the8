using Microsoft.Data.Entity.Metadata.Builders;
using TheEight.Common.Database.Entities.Teams;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public class SquadMemberWaterEventAttendee : WaterEventAttendee
    {
        public int SquadMemberId { get; set; }
        public SquadMember SquadMember { get; set; }
        
        internal static void BuildEntityType(EntityTypeBuilder<SquadMemberWaterEventAttendee> entityTypeBuilder)
        {
            entityTypeBuilder
                .HasOne(a => a.SquadMember)
                .WithMany(sm => sm.SquadMemberWaterEventAttendees)
                .HasForeignKey(a => a.SquadMemberId);
        }
    }
}