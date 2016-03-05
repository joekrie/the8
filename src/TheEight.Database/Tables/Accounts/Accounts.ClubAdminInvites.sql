CREATE TABLE [Accounts].[ClubAdminInvites]
(
	[InviteId] INT NOT NULL,
    [ClubRoleId] INT NOT NULL,
    [ClubId] INT NOT NULL, 
    CONSTRAINT [FK_ClubAdminInvites_Invites] FOREIGN KEY ([InviteId]) REFERENCES [Accounts].[Invites]([InviteId]),
	CONSTRAINT [FK_ClubAdminInvites_Clubs] FOREIGN KEY ([ClubId]) REFERENCES [Clubs].[Squads]([SquadId]),
	CONSTRAINT [FK_ClubAdminInvites_ClubRoles] FOREIGN KEY ([ClubRoleId]) 
		REFERENCES [Security].[ClubRoles]([ClubRoleId])
)