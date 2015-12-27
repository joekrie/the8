using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.Data.Entity.Metadata.Builders;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public class WaterEventBoat
    {
        public int WaterEventBoatId { get; set; }
        
        public int WaterPracticeId { get; set; }
        public WaterEvent WaterEvent { get; set; }

        public int BoatId { get; set; }
        public Boat Boat { get; set; }
        
        [Timestamp] public byte[] RowVersion { get; set; }

        public List<WaterEventPlacement> WaterEventPlacements { get; set; }

        internal static void BuildEntityType(EntityTypeBuilder<WaterEventBoat> entityTypeBuilder)
        {
            entityTypeBuilder
                .HasOne(b => b.WaterEvent)
                .WithMany(e => e.WaterPracticeBoats)
                .HasForeignKey(b => b.WaterPracticeId);

            entityTypeBuilder
                .HasOne(b => b.Boat)
                .WithMany(b => b.WaterPracticeBoats)
                .HasForeignKey(b => b.BoatId);
        }
    }
}