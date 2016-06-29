CREATE TABLE [dbo].[ERG_EVENTS]
(
	[EventId] UNIQUEIDENTIFIER NOT NULL, 
    [TestPieceOrder] TINYINT NULL, 
    [HasTestPiece] AS CAST(CASE WHEN [TestPieceOrder] IS NULL THEN 0 ELSE 1 END AS BIT) PERSISTED, 
    CONSTRAINT [PK__ERG_EVENTS] PRIMARY KEY ([EventId]), 	
    CONSTRAINT [AK__ERG_EVENTS__EventId__TestPieceOrder] UNIQUE ([EventId], [TestPieceOrder]), 
    CONSTRAINT [FK__ERG_EVENTS__ERG_EVENT_PIECES__TestPiece] FOREIGN KEY ([EventId], [TestPieceOrder]) 
		REFERENCES [ERG_EVENT_PIECES]([EventId], [PieceOrder])
)
