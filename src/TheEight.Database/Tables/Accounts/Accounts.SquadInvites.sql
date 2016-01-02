CREATE TABLE [Accounts].[SquadInvites]
(
	[InviteId] INT NOT NULL,
    [SquadId] INT NOT NULL,
    [SquadMemberRoleId] INT NOT NULL,
    CONSTRAINT [PK_SquadInvites] PRIMARY KEY ([InviteId]), 
    CONSTRAINT [FK_SquadInvites_Invites] FOREIGN KEY ([InviteId]) REFERENCES [Accounts].[Invites]([InviteId]),
	CONSTRAINT [FK_SquadInvites_Squads] FOREIGN KEY ([SquadId]) REFERENCES [Clubs].[Squads]([SquadId]),
	CONSTRAINT [FK_SquadInvites_SquadMemberRoles] FOREIGN KEY ([SquadMemberRoleId]) 
		REFERENCES [Clubs].[SquadMemberRoles]([SquadMemberRoleId])
)