CREATE TABLE [Security].[SquadRoles]
(
	[SquadRoleId] INT NOT NULL, 
    [Name] NVARCHAR(50) NOT NULL, 
    [Description] NVARCHAR(300) NOT NULL, 
    CONSTRAINT [PK_SquadRoles] PRIMARY KEY ([SquadRoleId])
)
