CREATE TABLE [ErgWorkouts].[Pieces]
(
	[PieceId] INT NOT NULL PRIMARY KEY, 
    [WorkoutId] INT NOT NULL, 
    [DistanceMeters] SMALLINT NULL, 
    [DurationMilliseconds] INT NULL,
	[Type] AS 
		CASE 
			WHEN [DistanceMeters] IS NOT NULL THEN 'FixedDistance'
			WHEN [DurationMilliseconds] IS NOT NULL THEN 'FixedDuration'
		END,
    CONSTRAINT [FK_Pieces_Workouts] FOREIGN KEY ([WorkoutId]) REFERENCES [ErgWorkouts].[Workouts]([WorkoutId]), 
    CONSTRAINT [CK_Pieces_DistanceMeters_Or_DurationMilliseconds] 
		CHECK ((DistanceMeters IS NOT NULL AND DurationMilliseconds IS NULL) 
		OR (DistanceMeters IS NULL AND DurationMilliseconds IS NOT NULL)), 
    CONSTRAINT [CK_Pieces_DistanceMeters_Range] CHECK (DistanceMeters > 0 AND DistanceMeters < 100000),
    CONSTRAINT [CK_Pieces_DurationMilliseconds_Range] CHECK (DurationMilliseconds > 0 AND DurationMilliseconds < 8000000)
)