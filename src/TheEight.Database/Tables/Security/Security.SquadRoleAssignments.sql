CREATE TABLE [Security].[SquadRoleAssignments]
(
	[SquadRoleId] INT NOT NULL, 
	[SquadMemberId] INT NOT NULL, 
    CONSTRAINT [PK_SquadRoleAssignments] PRIMARY KEY ([SquadRoleId], [SquadMemberId])
)
