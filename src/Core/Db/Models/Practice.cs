using System.Collections.Generic;
using NodaTime;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class Practice
    {
        public LocalDate Date { get; set; }
        public IList<string> UnassignedRowerUserIds { get; set; }
        public IList<BoatLineup> Boats { get; set; } 
    }
}