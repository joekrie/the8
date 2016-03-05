CREATE TABLE [Security].[ClubRoleAssignments]
(
    [ClubRoleId] INT NOT NULL, 
	[ClubMemberId] INT NOT NULL, 
    CONSTRAINT [PK_ClubRoleAssignments] PRIMARY KEY ([ClubRoleId], [ClubMemberId])
)