CREATE TABLE [Accounts].[ClubAdminInvites]
(
	[InviteId] INT NOT NULL,
    [ClubAdminRoleId] INT NOT NULL,
    [ClubId] INT NOT NULL, 
    CONSTRAINT [FK_ClubAdminInvites_Invites] FOREIGN KEY ([InviteId]) REFERENCES [Accounts].[Invites]([InviteId]),
	CONSTRAINT [FK_ClubAdminInvites_Clubs] FOREIGN KEY ([ClubId]) REFERENCES [Clubs].[Squads]([SquadId]),
	CONSTRAINT [FK_ClubAdminInvites_ClubAdminRoles] FOREIGN KEY ([ClubAdminRoleId]) 
		REFERENCES [Clubs].[ClubAdminRoles]([ClubAdminRoleId])
)