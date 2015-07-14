using NodaTime;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class ErgPieceResult
    {
        public string UserId { get; set; }
        public Duration Split { get; set; }
    }
}