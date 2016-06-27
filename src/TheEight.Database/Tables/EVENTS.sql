﻿CREATE TABLE [dbo].[EVENTS]
(
	[EventId] UNIQUEIDENTIFIER NOT NULL, 
    [Date] DATE NOT NULL, 
    [Time] TIME(0) NULL, 
    [Notes] NVARCHAR(MAX) NOT NULL DEFAULT '', 
    CONSTRAINT [PK__EVENTS] PRIMARY KEY ([EventId])
)