CREATE VIEW [dbo].[ERG_EVENT_RESULT_CALCULATIONS]
WITH SCHEMABINDING AS 
	SELECT 
		res.[EventId],
		res.[PieceOrder],
		res.[AttendeeId],
		CASE
			WHEN pc.[DistanceInMeters] IS NOT NULL THEN pc.[DistanceInMeters]
			ELSE [dbo].[FN__Calculate_Distance_In_Meters](res.[SplitInMilliseconds], pc.[DurationInSeconds] * 1000)
		END AS [DistanceInMeters],
		CASE
			WHEN pc.[DurationInSeconds] IS NOT NULL THEN pc.[DurationInSeconds]
			ELSE [dbo].[FN__Calculate_Duration_In_Milliseconds](res.[SplitInMilliseconds], pc.[DistanceInMeters]) / 1000
		END AS [DurationInSeconds],
		res.[SplitInMilliseconds]
	FROM [dbo].[ERG_EVENT_RESULTS] AS res
	INNER JOIN [dbo].[ERG_EVENT_PIECES] AS pc
		ON pc.[EventId] = res.[EventId] AND pc.[PieceOrder] = res.[PieceOrder]

GO

CREATE UNIQUE CLUSTERED INDEX [IX__ERG_EVENT_RESULT_CALCULATIONS]
	ON [dbo].[ERG_EVENT_RESULT_CALCULATIONS] ([EventId], [PieceOrder], [AttendeeId])
