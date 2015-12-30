CREATE TABLE [Clubs].[ClubMembers]
(
	[ClubId] INT NOT NULL, 
    [UserId] INT NOT NULL, 
    PRIMARY KEY ([ClubId], [UserId])
)
