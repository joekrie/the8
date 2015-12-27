using TheEight.Common.Database.Entities.Teams;

namespace TheEight.Common.Database.Entities.ErgPractices
{
    public class PieceResult
    {
        public long SplitMilliseconds { get; set; }

        public int PieceId { get; set; }
        public Piece Piece { get; set; }

        public int SquadMemberId { get; set; }
        public SquadMember SquadMember { get; set; }
    }
}