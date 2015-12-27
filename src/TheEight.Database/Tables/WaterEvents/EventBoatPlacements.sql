CREATE TABLE [WaterEvents].[EventBoatPlacements]
(
	[EventBoatPlacementId] INT NOT NULL PRIMARY KEY IDENTITY,
	[EventId] INT NOT NULL,
	[BoatId] INT NOT NULL,
    [AttendeeId] INT NOT NULL,
    [Seat] TINYINT NOT NULL,
    CONSTRAINT [AK_EventBoatPlacements_EventId_BoatId_AttendeeId] UNIQUE ([EventId], [BoatId], [AttendeeId]),
    CONSTRAINT [AK_EventBoatPlacements_EventId_BoatId_Seat] UNIQUE ([EventId], [BoatId], [Seat]),
    CONSTRAINT [CK_EventBoatPlacements_Seat] CHECK (Seat >= 0 AND Seat <= 8),
    CONSTRAINT [FK_EventBoatPlacements_EventBoats] FOREIGN KEY ([EventId], [BoatId]) REFERENCES [WaterEvents].[EventBoats]([EventId], [BoatId]),
    CONSTRAINT [FK_EventBoatPlacements_Attendees] FOREIGN KEY ([AttendeeId]) REFERENCES [WaterEvents].[Attendees]([AttendeeId])
)