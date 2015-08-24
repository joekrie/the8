module app.domain {
    interface TeamPieceResults {
        piece: PieceInfo;
        results: { [rowerId: string]: Result };
    }
}