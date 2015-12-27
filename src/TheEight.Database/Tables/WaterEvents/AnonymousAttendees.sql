CREATE TABLE [WaterEvents].[AnonymousAttendees]
(
	[AttendeeId] INT NOT NULL PRIMARY KEY,
    [GivenName] NVARCHAR(100) NOT NULL,
    [Surname] NVARCHAR(100) NOT NULL,
	CONSTRAINT [FK_AnonymousAttendees_Attendees] FOREIGN KEY ([AttendeeId]) REFERENCES [WaterEvents].[Attendees]([AttendeeId])
)