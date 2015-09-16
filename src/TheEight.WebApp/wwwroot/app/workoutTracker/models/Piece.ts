import pieceInfo = require("PieceInfo");
import result = require("Result");

export interface Piece {
    piece: pieceInfo.PieceInfo;
    results: { [rowerId: string]: result.Result };
}