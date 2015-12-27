namespace TheEight.Common.Database.Entities.ErgPractices
{
    public class Piece
    {
        public int PieceId { get; set; }
        
        public PieceType Type { get; set; }
        public long MetersOrMilliseconds { get; set; }
    }
}