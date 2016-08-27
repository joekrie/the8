CREATE FUNCTION [dbo].[FN__Calculate_Distance_In_Meters]
(
	@splitInMilliseconds int,
	@durationInMilliseconds int
)
RETURNS SMALLINT
WITH SCHEMABINDING AS 
BEGIN
	DECLARE @factor DECIMAL = @durationInMilliseconds / @splitInMilliseconds;
	RETURN @factor * 500;
END
