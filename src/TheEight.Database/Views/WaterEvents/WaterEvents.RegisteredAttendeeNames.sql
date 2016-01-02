CREATE VIEW [WaterEvents].[RegisteredAttendeeNames] 
AS
SELECT ra.[AttendeeId], u.[GivenName], u.[Surname]
FROM [WaterEvents].[RegisteredAttendees] AS ra
INNER JOIN [Accounts].[Users] AS u
	ON u.[UserId] = ra.[UserId]