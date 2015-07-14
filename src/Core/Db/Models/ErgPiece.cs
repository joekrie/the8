using System.Collections.Generic;

namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public interface IErgPiece
    {
        IList<ErgPieceResult> Results { get; set; } 
    }
}