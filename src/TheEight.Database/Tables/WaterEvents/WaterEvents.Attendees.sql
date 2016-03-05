CREATE TABLE [WaterEvents].[Attendees]
(
	[AttendeeId] INT NOT NULL PRIMARY KEY, 
    [EventId] INT NOT NULL, 
    CONSTRAINT [FK_Attendees_Events] FOREIGN KEY ([EventId]) REFERENCES [WaterEvents].[Events]([EventId])
)