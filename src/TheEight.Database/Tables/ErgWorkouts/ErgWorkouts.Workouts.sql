CREATE TABLE [ErgWorkouts].[Workouts]
(
	[WorkoutId] INT NOT NULL PRIMARY KEY IDENTITY,
    [SquadId] INT NOT NULL, 
    [Date] DATE NOT NULL
)
