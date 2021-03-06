﻿CREATE TABLE [dbo].[ERG_EVENT_RESULTS]
(
	[EventId] UNIQUEIDENTIFIER NOT NULL, 
    [PieceOrder] TINYINT NOT NULL, 
    [AttendeeId] UNIQUEIDENTIFIER NOT NULL, 
    [SplitInMilliseconds] INT NOT NULL, 
    CONSTRAINT [PK__ERG_EVENT_RESULTS] PRIMARY KEY ([AttendeeId], [EventId], [PieceOrder]), 
    CONSTRAINT [FK__ERG_EVENT_RESULTS__ERG_EVENT_PIECES] FOREIGN KEY ([EventId], [PieceOrder]) 
		REFERENCES [ERG_EVENT_PIECES]([EventId], [PieceOrder]), 
    CONSTRAINT [FK__ERG_EVENT_RESULTS__WATER_EVENT_ATTENDEES] FOREIGN KEY ([AttendeeId]) 
		REFERENCES [WATER_EVENT_ATTENDEES]([AttendeeId]), 
    CONSTRAINT [CK__ERG_EVENT_RESULTS__SplitInMilliseconds__Range] 
		CHECK (SplitInMilliseconds > 30000 AND SplitInMilliseconds < 240000) 
)
