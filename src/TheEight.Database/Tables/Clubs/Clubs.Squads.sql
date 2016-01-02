CREATE TABLE [Clubs].[Squads]
(
	[SquadId] INT NOT NULL ,
    [ClubId] INT NOT NULL,
    [Name] NVARCHAR(50) NOT NULL, 
    [Start] DATE NULL, 
    [End] DATE NULL, 
    CONSTRAINT [FK_Squads_Clubs] FOREIGN KEY ([ClubId]) REFERENCES [Clubs].[Clubs]([ClubId]), 
    CONSTRAINT [PK_Squads] PRIMARY KEY ([SquadId])
)
