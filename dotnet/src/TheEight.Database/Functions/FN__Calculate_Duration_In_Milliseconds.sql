CREATE FUNCTION [dbo].[FN__Calculate_Duration_In_Milliseconds]
(
	@splitInMilliseconds int,
	@distanceInMeters int
)
RETURNS SMALLINT 
WITH SCHEMABINDING AS 
BEGIN
	DECLARE @fiveHundreds DECIMAL = @distanceInMeters / 500;
	RETURN @splitInMilliseconds * @fiveHundreds;
END
