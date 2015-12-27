using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TheEight.Common.Database.Entities.Teams;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public class Boat
    {
        public int BoatId { get; set; }

        public string Title { get; set; }
        public int RowerCount { get; set; }
        public bool IsCoxed { get; set; }

        public int? ClubId { get; set; }
        public Club Club { get; set; }

        [Timestamp] public byte[] RowVersion { get; set; }

        [NotMapped] public BoatType BoatType => ClubId.HasValue ? BoatType.Club : BoatType.Anonymous;

        public List<WaterEventBoat> WaterPracticeBoats { get; set; }
    }
}