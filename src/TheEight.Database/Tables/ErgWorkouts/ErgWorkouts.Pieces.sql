CREATE TABLE [ErgWorkouts].[Pieces]
(
	[PieceId] INT NOT NULL , 
    [WorkoutId] INT NOT NULL, 
	[PieceOrder] INT NOT NULL, 
    [DistanceMeters] SMALLINT NULL, 
    [DurationMilliseconds] INT NULL,
	[PieceTypeId] AS 
		CASE 
			WHEN [DistanceMeters] IS NOT NULL THEN 1
			WHEN [DurationMilliseconds] IS NOT NULL THEN 2
		END PERSISTED,
    CONSTRAINT [FK_Pieces_Workouts] FOREIGN KEY ([WorkoutId]) REFERENCES [ErgWorkouts].[Workouts]([WorkoutId]), 
    CONSTRAINT [CK_Pieces_DistanceMeters_Or_DurationMilliseconds] 
		CHECK ((DistanceMeters IS NOT NULL AND DurationMilliseconds IS NULL) 
			OR (DistanceMeters IS NULL AND DurationMilliseconds IS NOT NULL)), 
    CONSTRAINT [CK_Pieces_DistanceMeters_Range] CHECK (DistanceMeters > 0 AND DistanceMeters < 100000),
    CONSTRAINT [CK_Pieces_DurationMilliseconds_Range] CHECK (DurationMilliseconds > 0 AND DurationMilliseconds < 8000000), 
    CONSTRAINT [FK_Pieces_PieceTypes] FOREIGN KEY ([PieceTypeId]) REFERENCES [ErgWorkouts].[PieceTypes]([PieceTypeId]), 
    CONSTRAINT [PK_Pieces] PRIMARY KEY ([PieceId]), 
    CONSTRAINT [AK_Pieces_WorkoutId_PieceOrder] UNIQUE ([WorkoutId], [PieceOrder])
)