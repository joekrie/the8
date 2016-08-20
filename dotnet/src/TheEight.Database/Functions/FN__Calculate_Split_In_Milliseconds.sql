CREATE FUNCTION [dbo].[FN__Calculate_Split_In_Milliseconds]
(
	@durationInMilliseconds int,
	@distanceInMeters int
)
RETURNS SMALLINT
WITH SCHEMABINDING AS 
BEGIN
	DECLARE @fiveHundreds DECIMAL = @distanceInMeters / 500;
	RETURN @durationInMilliseconds / @fiveHundreds;
END
