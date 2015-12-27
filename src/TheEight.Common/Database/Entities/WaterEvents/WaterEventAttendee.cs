using System.ComponentModel.DataAnnotations;
using Microsoft.Data.Entity.Metadata.Builders;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public abstract class WaterEventAttendee
    {
        public int WaterEventAttendeeId { get; set; }

        public int WaterEventId { get; set; }
        public WaterEvent WaterEvent { get; set; }
        
        [Timestamp] public byte[] RowVersion { get; set; }
        
        internal static void BuildEntityType(EntityTypeBuilder<WaterEventAttendee> entityTypeBuilder)
        {
            entityTypeBuilder
                .HasOne(wpa => wpa.WaterEvent)
                .WithMany(wp => wp.WaterPracticeAttendees)
                .HasForeignKey(wpa => wpa.WaterEventId);
        }
    }

    public class WaterEventAttendeeViewRow
    {
        public int WaterEventAttendeeId { get; set; }

        public string GivenName { get; set; }
        public string Surname { get; set; }

        [Timestamp] public byte[] RowVersion { get; set; }

        internal static void BuildEntityType(EntityTypeBuilder<WaterEventAttendee> entityTypeBuilder)
        {
            
        }

        internal static string CreateView()
        {
            return @"
                SELECT * 
                FROM 
            ";
        }
    }
}