CREATE TABLE [BoatEvents].[Event]
(
	[EventId] INT NOT NULL IDENTITY, 
    [Date] DATE NOT NULL, 
    [Title] NVARCHAR(100) NOT NULL, 
    CONSTRAINT [PK_Event] PRIMARY KEY ([EventId]) 
)
