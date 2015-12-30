CREATE TABLE [WaterEvents].[Events]
(
	[EventId] INT NOT NULL PRIMARY KEY IDENTITY,
	[SquadId] INT NOT NULL,
    [Date] DATE NOT NULL,
    CONSTRAINT [FK_Events_Squads] FOREIGN KEY ([SquadId]) REFERENCES [Clubs].[Squads]([SquadId])
)