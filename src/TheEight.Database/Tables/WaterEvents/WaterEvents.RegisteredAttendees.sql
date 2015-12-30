CREATE TABLE [WaterEvents].[RegisteredAttendees]
(
    [AttendeeId] INT NOT NULL PRIMARY KEY,
    [UserId] INT NOT NULL, 
    CONSTRAINT [FK_RegisteredAttendees_Users] FOREIGN KEY ([UserId]) REFERENCES [Accounts].[Users]([UserId]), 
    CONSTRAINT [FK_RegisteredAttendees_Attendees] FOREIGN KEY ([AttendeeId]) REFERENCES [WaterEvents].[Attendees]([AttendeeId])
)