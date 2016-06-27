﻿CREATE TABLE [dbo].[CLUB_MEMBERS]
(
    [UserId] UNIQUEIDENTIFIER NOT NULL, 
    [ClubId] UNIQUEIDENTIFIER NOT NULL, 
    CONSTRAINT [PK__CLUB_MEMBERS] PRIMARY KEY ([UserId], [ClubId]), 
    CONSTRAINT [FK__CLUB_MEMBERS__USERS] FOREIGN KEY ([UserId]) REFERENCES [USERS]([UserId]),
    CONSTRAINT [FK__CLUB_MEMBERS__CLUBS] FOREIGN KEY ([ClubId]) REFERENCES [CLUBS]([ClubId])
)