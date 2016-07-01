CREATE VIEW [dbo].[TEAM_MEMBERS_USER_INFO] 
WITH SCHEMABINDING AS
	SELECT 
		tm.[TeamMemberId],
		tm.[PreferredBoatPositionId],
		u.[GivenName],
		u.[Surname]
	FROM [dbo].[TEAM_MEMBERS] AS tm
	INNER JOIN [dbo].[CLUB_MEMBERS] AS cm
		ON cm.[ClubMemberId] = tm.[ClubMemberId]
	INNER JOIN [dbo].[USERS] AS u
		ON u.[UserId] = cm.[UserId]
