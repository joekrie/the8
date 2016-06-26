﻿CREATE TABLE [dbo].[TEAMS]
(
	[TeamId] UNIQUEIDENTIFIER NOT NULL, 
    [Name] NVARCHAR(50) NOT NULL, 
    [StartDate] DATE NOT NULL, 
    [EndDate] DATE NULL, 
    CONSTRAINT [PK__TEAMS] PRIMARY KEY ([TeamId])
)
