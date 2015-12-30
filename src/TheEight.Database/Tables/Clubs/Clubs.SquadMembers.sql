CREATE TABLE [Clubs].[SquadMembers]
(
    [SquadMemberId] INT NOT NULL PRIMARY KEY IDENTITY,
	[UserId] INT NOT NULL,
    [SquadId] INT NOT NULL,
    [SquadMemberRoleId] INT NOT NULL,
    CONSTRAINT [FK_SquadMembers_Squads] FOREIGN KEY ([SquadId]) REFERENCES [Clubs].[Squads]([SquadId]),
    CONSTRAINT [FK_SquadMembers_SquadMemberRoles] FOREIGN KEY ([SquadMemberRoleId]) REFERENCES [Clubs].[SquadMemberRoles]([SquadMemberRoleId]),
    CONSTRAINT [FK_SquadMembers_Users] FOREIGN KEY ([UserId]) REFERENCES [Accounts].[Users]([UserId]),
	CONSTRAINT [AK_SquadMembers_UserId_SquadId] UNIQUE ([UserId], [SquadId])
)