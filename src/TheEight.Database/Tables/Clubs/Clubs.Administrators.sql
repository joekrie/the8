CREATE TABLE [Clubs].[Administrators]
(
	[ClubId] INT NOT NULL, 
    [UserId] INT NOT NULL, 
    CONSTRAINT [PK_Administrators] PRIMARY KEY ([UserId], [ClubId])
)
