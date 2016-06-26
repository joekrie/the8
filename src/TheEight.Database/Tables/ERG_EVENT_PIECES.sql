﻿CREATE TABLE [dbo].[ERG_EVENT_PIECES]
(
	[EventId] UNIQUEIDENTIFIER NOT NULL, 
    [PieceOrder] TINYINT NOT NULL, 
    [DistanceInMeters] SMALLINT NULL, 
    [DurationInSeconds] SMALLINT NULL, 
    CONSTRAINT [PK__ERG_EVENT_PIECES] PRIMARY KEY ([PieceOrder], [EventId]), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__PieceOrder] CHECK (PieceOrder > 0), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__DistanceInMeters] CHECK (DistanceInMeters > 0), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__DurationInSeconds] CHECK (DurationInSeconds > 0), 
    CONSTRAINT [CK__ERG_EVENT_PIECES__DistanceInMeters__DurationInSeconds] CHECK (
		(DistanceInMeters IS NULL AND DistanceInMeters IS NOT NULL)
		OR (DistanceInMeters IS NOT NULL AND DistanceInMeters IS NULL)
	), 
    CONSTRAINT [FK__ERG_EVENT_PIECES__ERG_EVENTS] FOREIGN KEY ([EventId]) REFERENCES [ERG_EVENTS]([EventId]) 
)
