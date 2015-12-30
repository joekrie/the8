CREATE TABLE [ErgWorkouts].[Results]
(
	[PieceId] INT NOT NULL, 
    [SquadMemberId] INT NOT NULL, 
    [SplitMilliseconds] INT NOT NULL,
    PRIMARY KEY ([SquadMemberId], [PieceId]), 
    CONSTRAINT [FK_Results_Pieces] FOREIGN KEY ([PieceId]) REFERENCES [ErgWorkouts].[Pieces]([PieceId]), 
    CONSTRAINT [FK_Results_SquadMembers] FOREIGN KEY ([SquadMemberId]) REFERENCES [Clubs].[SquadMembers]([SquadMemberId])
)
