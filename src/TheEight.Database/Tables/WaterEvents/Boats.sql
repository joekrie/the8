CREATE TABLE [WaterEvents].[Boats]
(
	[BoatId] INT NOT NULL PRIMARY KEY IDENTITY, 
	[ClubId] INT NULL,
    [Name] NVARCHAR(50) NOT NULL, 
    [IsCoxed] BIT NOT NULL, 
    [RowerCount] TINYINT NOT NULL, 
    CONSTRAINT [FK_Boats_Clubs] FOREIGN KEY ([ClubId]) REFERENCES [Clubs].[Clubs]([ClubId]), 
    CONSTRAINT [CK_Boats_RowerCount] CHECK (RowerCount > 0 AND RowerCount <= 8)
)