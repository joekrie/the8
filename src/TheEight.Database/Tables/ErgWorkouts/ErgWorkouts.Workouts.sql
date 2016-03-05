CREATE TABLE [ErgWorkouts].[Workouts]
(
	[WorkoutId] INT NOT NULL PRIMARY KEY IDENTITY,
    [SquadId] INT NOT NULL, 
    [Date] DATE NOT NULL, 
    [Title] NVARCHAR(50) NOT NULL, 
    [Comments] NVARCHAR(MAX) NULL, 
    CONSTRAINT [FK_Workouts_Squads] FOREIGN KEY ([SquadId]) REFERENCES [Clubs].[Squads]([SquadId])
)