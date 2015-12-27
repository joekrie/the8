CREATE TABLE [Clubs].[Squads]
(
	[SquadId] INT NOT NULL PRIMARY KEY,
    [ClubId] INT NOT NULL,
    [Name] NVARCHAR(50) NOT NULL, 
    [Start] DATE NULL, 
    [End] DATE NULL, 
    CONSTRAINT [FK_Squads_Clubs] FOREIGN KEY ([ClubId]) REFERENCES [Clubs].[Clubs]([ClubId])
)
