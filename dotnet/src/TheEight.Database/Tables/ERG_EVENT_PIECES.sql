CREATE TABLE [dbo].[ERG_EVENT_PIECES]
(
	[EventId] UNIQUEIDENTIFIER NOT NULL, 
    [PieceOrder] TINYINT NOT NULL, 
    [DistanceInMeters] INT NULL, 
    [DurationInSeconds] SMALLINT NULL, 
    [PieceTypeId] AS CAST(
		CASE
			WHEN DistanceInMeters IS NULL AND DistanceInMeters IS NOT NULL THEN 1
			ELSE 2
		END AS TINYINT
	) PERSISTED, 
    CONSTRAINT [PK__ERG_EVENT_PIECES] PRIMARY KEY ([EventId], [PieceOrder]), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__PieceOrder__Positive] CHECK (PieceOrder > 0), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__DistanceInMeters__Range] 
		CHECK (DistanceInMeters > 0 AND DistanceInMeters < 100000), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__DurationInSeconds__Range] 
		CHECK (DurationInSeconds > 0 AND DurationInSeconds < 10000), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__DistanceInMeters__DurationInSeconds__OneAndOnlyOne] CHECK (
		(DistanceInMeters IS NULL AND DistanceInMeters IS NOT NULL)
			OR (DistanceInMeters IS NOT NULL AND DistanceInMeters IS NULL)
	), 
    CONSTRAINT [FK__ERG_EVENT_PIECES__ERG_EVENTS] FOREIGN KEY ([EventId]) REFERENCES [ERG_EVENTS]([EventId]), 
    CONSTRAINT [FK__ERG_EVENT_PIECES__ERG_EVENT_PIECE_TYPES] FOREIGN KEY ([PieceTypeId]) 
		REFERENCES [ERG_EVENT_PIECE_TYPES]([PieceTypeId]) 
)
