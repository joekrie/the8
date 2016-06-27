﻿CREATE TABLE [dbo].[EVENT_ATTENDEES]
(
	[AttendeeId] UNIQUEIDENTIFIER NOT NULL, 
    [EventId] UNIQUEIDENTIFIER NOT NULL, 
    CONSTRAINT [PK__EVENT_ATTENDEES] PRIMARY KEY ([AttendeeId]), 
    CONSTRAINT [FK__EVENT_ATTENDEES__EVENTS] FOREIGN KEY ([EventId]) REFERENCES [EVENTS]([EventId])
)