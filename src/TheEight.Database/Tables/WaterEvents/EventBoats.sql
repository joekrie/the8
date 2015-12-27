CREATE TABLE [WaterEvents].[EventBoats]
(
	[EventId] INT NOT NULL, 
	[BoatId] INT NOT NULL, 
    PRIMARY KEY ([BoatId], [EventId]), 
    CONSTRAINT [FK_EventBoats_Events] FOREIGN KEY ([EventId]) REFERENCES [WaterEvents].[Events]([EventId]), 
    CONSTRAINT [FK_EventBoats_Boats] FOREIGN KEY ([BoatId]) REFERENCES [WaterEvents].[Boats]([BoatId])
)
