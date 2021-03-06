﻿CREATE TABLE [dbo].[CLUB_BOATS]
(
	[BoatId] UNIQUEIDENTIFIER NOT NULL, 
    [ClubId] UNIQUEIDENTIFIER NOT NULL, 
    [Name] NVARCHAR(50) NOT NULL, 
    [SeatCount] TINYINT NOT NULL, 
    [IsCoxed] BIT NOT NULL, 
    CONSTRAINT [PK__CLUB_BOATS] PRIMARY KEY ([BoatId]), 
    CONSTRAINT [FK__CLUB_BOATS__CLUBS] FOREIGN KEY ([ClubId]) 
		REFERENCES [CLUBS]([ClubId]), 
    CONSTRAINT [AK__CLUB_BOATS__ClubId__Name] UNIQUE ([ClubId], [Name]), 
    CONSTRAINT [CK__CLUB_BOATS__SeatCount] CHECK (SeatCount >= 1 AND SeatCount <= 8) 
)
