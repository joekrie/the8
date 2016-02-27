CREATE TABLE [Security].[ClubRoles]
(
    [ClubRoleId] INT NOT NULL, 
    [Name] NVARCHAR(50) NOT NULL, 
	[Description] NVARCHAR(300) NOT NULL, 
    CONSTRAINT [PK_ClubRoles] PRIMARY KEY ([ClubRoleId])
)