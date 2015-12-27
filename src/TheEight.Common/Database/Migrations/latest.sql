IF OBJECT_ID(N'__EFMigrationsHistory') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;

GO

CREATE TABLE [User] (
    [UserId] int NOT NULL IDENTITY,
    [AccountKey] nvarchar(max),
    [AccountProvider] int NOT NULL,
    [CellPhone] nvarchar(max),
    [Email] nvarchar(max),
    [GivenName] nvarchar(max),
    [Surname] nvarchar(max),
    CONSTRAINT [PK_User] PRIMARY KEY ([UserId])
);

GO

CREATE TABLE [Club] (
    [ClubId] int NOT NULL IDENTITY,
    [Name] nvarchar(max),
    CONSTRAINT [PK_Club] PRIMARY KEY ([ClubId])
);

GO

CREATE TABLE [WaterPractice] (
    [WaterPracticeId] int NOT NULL IDENTITY,
    CONSTRAINT [PK_WaterPractice] PRIMARY KEY ([WaterPracticeId])
);

GO

CREATE TABLE [ClubMember] (
    [ClubMemberId] int NOT NULL IDENTITY,
    [ClubId] int NOT NULL,
    [MemberSince] datetime2 NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_ClubMember] PRIMARY KEY ([ClubMemberId]),
    CONSTRAINT [FK_ClubMember_Club_ClubId] FOREIGN KEY ([ClubId]) REFERENCES [Club] ([ClubId]) ON DELETE CASCADE,
    CONSTRAINT [FK_ClubMember_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([UserId]) ON DELETE CASCADE
);

GO

CREATE TABLE [Squad] (
    [SquadId] int NOT NULL IDENTITY,
    [ClubId] int NOT NULL,
    [End] datetime2 NOT NULL,
    [Name] nvarchar(max),
    [Start] datetime2 NOT NULL,
    CONSTRAINT [PK_Squad] PRIMARY KEY ([SquadId]),
    CONSTRAINT [FK_Squad_Club_ClubId] FOREIGN KEY ([ClubId]) REFERENCES [Club] ([ClubId]) ON DELETE CASCADE
);

GO

CREATE TABLE [Boat] (
    [BoatId] int NOT NULL IDENTITY,
    [Discriminator] nvarchar(max) NOT NULL,
    [IsCoxed] bit NOT NULL,
    [RowerCount] int NOT NULL,
    [Title] nvarchar(max),
    [ClubId] int,
    CONSTRAINT [PK_Boat] PRIMARY KEY ([BoatId]),
    CONSTRAINT [FK_Boat_Club_ClubId] FOREIGN KEY ([ClubId]) REFERENCES [Club] ([ClubId]) ON DELETE CASCADE
);

GO

CREATE TABLE [SquadMember] (
    [SquadMemberId] int NOT NULL IDENTITY,
    [ClubMemberId] int NOT NULL,
    [Role] int NOT NULL,
    [SquadId] int NOT NULL,
    CONSTRAINT [PK_SquadMember] PRIMARY KEY ([SquadMemberId]),
    CONSTRAINT [FK_SquadMember_ClubMember_ClubMemberId] FOREIGN KEY ([ClubMemberId]) REFERENCES [ClubMember] ([ClubMemberId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_SquadMember_Squad_SquadId] FOREIGN KEY ([SquadId]) REFERENCES [Squad] ([SquadId]) ON DELETE NO ACTION
);

GO

CREATE TABLE [WaterPracticeBoat] (
    [WaterPracticeBoatId] int NOT NULL IDENTITY,
    [BoatId] int NOT NULL,
    [WaterPracticeId] int NOT NULL,
    CONSTRAINT [PK_WaterPracticeBoat] PRIMARY KEY ([WaterPracticeBoatId]),
    CONSTRAINT [FK_WaterPracticeBoat_Boat_BoatId] FOREIGN KEY ([BoatId]) REFERENCES [Boat] ([BoatId]) ON DELETE CASCADE,
    CONSTRAINT [FK_WaterPracticeBoat_WaterPractice_WaterPracticeId] FOREIGN KEY ([WaterPracticeId]) REFERENCES [WaterPractice] ([WaterPracticeId]) ON DELETE CASCADE
);

GO

CREATE TABLE [WaterPracticeAttendee] (
    [WaterPracticeAttendeeId] int NOT NULL IDENTITY,
    [SquadMemberId] int NOT NULL,
    [WaterPracticeBoatId] int,
    [WaterPracticeId] int NOT NULL,
    CONSTRAINT [PK_WaterPracticeAttendee] PRIMARY KEY ([WaterPracticeAttendeeId]),
    CONSTRAINT [AK_WaterPracticeAttendee_WaterPracticeId_SquadMemberId] UNIQUE ([WaterPracticeId], [SquadMemberId]),
    CONSTRAINT [FK_WaterPracticeAttendee_SquadMember_SquadMemberId] FOREIGN KEY ([SquadMemberId]) REFERENCES [SquadMember] ([SquadMemberId]) ON DELETE CASCADE,
    CONSTRAINT [FK_WaterPracticeAttendee_WaterPracticeBoat_WaterPracticeBoatId] FOREIGN KEY ([WaterPracticeBoatId]) REFERENCES [WaterPracticeBoat] ([WaterPracticeBoatId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_WaterPracticeAttendee_WaterPractice_WaterPracticeId] FOREIGN KEY ([WaterPracticeId]) REFERENCES [WaterPractice] ([WaterPracticeId]) ON DELETE CASCADE
);

GO

CREATE INDEX [IX_ClubMember_ClubId] ON [ClubMember] ([ClubId]);

GO

CREATE INDEX [IX_ClubMember_UserId] ON [ClubMember] ([UserId]);

GO

CREATE INDEX [IX_Squad_ClubId] ON [Squad] ([ClubId]);

GO

CREATE INDEX [IX_SquadMember_ClubMemberId] ON [SquadMember] ([ClubMemberId]);

GO

CREATE INDEX [IX_SquadMember_SquadId] ON [SquadMember] ([SquadId]);

GO

CREATE INDEX [IX_Boat_ClubId] ON [Boat] ([ClubId]);

GO

CREATE INDEX [IX_WaterPracticeAttendee_SquadMemberId] ON [WaterPracticeAttendee] ([SquadMemberId]);

GO

CREATE INDEX [IX_WaterPracticeAttendee_WaterPracticeBoatId] ON [WaterPracticeAttendee] ([WaterPracticeBoatId]);

GO

CREATE INDEX [IX_WaterPracticeAttendee_WaterPracticeId] ON [WaterPracticeAttendee] ([WaterPracticeId]);

GO

CREATE INDEX [IX_WaterPracticeBoat_BoatId] ON [WaterPracticeBoat] ([BoatId]);

GO

CREATE INDEX [IX_WaterPracticeBoat_WaterPracticeId] ON [WaterPracticeBoat] ([WaterPracticeId]);

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20151224192916_First', N'7.0.0-rc2-16630');

GO

