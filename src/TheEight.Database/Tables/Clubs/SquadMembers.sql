CREATE TABLE [Clubs].[SquadMembers]
(
	[UserId] INT NOT NULL, 
    [SquadId] INT NOT NULL, 
    [SquadMemberRoleId] INT NOT NULL, 
    PRIMARY KEY ([UserId], [SquadId]),
    CONSTRAINT [FK_SquadMembers_Squads] FOREIGN KEY ([SquadId]) REFERENCES [Clubs].[Squads]([SquadId]),
    CONSTRAINT [FK_SquadMembers_SquadMemberRoles] FOREIGN KEY ([SquadMemberRoleId]) REFERENCES [Clubs].[SquadMemberRoles]([SquadMemberRoleId])
)