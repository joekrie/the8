﻿CREATE TABLE [dbo].[WATER_EVENT_ATTENDEES]
(
	[WaterEventAttendeeId] UNIQUEIDENTIFIER NOT NULL, 
    [WaterEventId] UNIQUEIDENTIFIER NOT NULL, 
    [WaterEventAttendeePositionId] TINYINT NOT NULL, 
    [GivenName] NVARCHAR(50) NOT NULL, 
    [Surname] NVARCHAR(50) NOT NULL, 
    CONSTRAINT [PK__WATER_EVENT_ATTENDEES] PRIMARY KEY ([WaterEventAttendeeId]), 
    CONSTRAINT [FK__WATER_EVENT_ATTENDEES__WATER_EVENTS] FOREIGN KEY ([WaterEventId]) REFERENCES [WATER_EVENTS]([EventId])
)
