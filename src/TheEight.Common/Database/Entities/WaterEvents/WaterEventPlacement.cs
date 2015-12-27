using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.Data.Entity.Metadata.Builders;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public abstract class WaterEventPlacement
    {
        public const int CoxswainSeat = 0;

        public int WaterEventPlacementId { get; set; }

        public int WaterEventAttendeeId { get; set; }
        public WaterEventAttendee WaterEventAttendee { get; set; }

        public int WaterEventBoatId { get; set; }
        public WaterEventBoat WaterEventBoat { get; set; }
        
        public int Seat { get; set; }

        [Timestamp] public byte[] RowVersion { get; set; }

        public bool ValidateSeatNumber()
        {
            if (WaterEventBoat == null)
            {
                throw new InvalidOperationException($"{nameof(WaterEventBoat)} not loaded.");
            }

            if (WaterEventBoat.Boat == null)
            {
                throw new InvalidOperationException($"{nameof(WaterEventBoat)}.{nameof(WaterEventBoat.Boat)} not loaded.");
            }
                            
            if (WaterEventBoat.Boat.IsCoxed && Seat == CoxswainSeat)
            {
                return true;
            }

            if (Seat < 0)
            {
                return false;
            }

            return Seat <= WaterEventBoat.Boat.RowerCount;
        }

        internal static void BuildEntityType(EntityTypeBuilder<WaterEventPlacement> entityTypeBuilder)
        {
            entityTypeBuilder.HasAlternateKey(p => new {p.WaterEventBoatId, p.Seat});
        }
    }
}