CREATE VIEW [dbo].[VW__WATER_EVENT_ATTENDEES__AllAttendees] AS 
	SELECT
		wea.[AttendeeId],
		tmui.[GivenName],
		tmui.[Surname],
		tmui.[PreferredBoatPositionId],
		CAST(1 AS BIT) AS [IsTeamMember]
	FROM [dbo].[WATER_EVENT_ATTENDEES] AS wea
	INNER JOIN [dbo].[TEAM_MEMBER_EVENT_ATTENDEES] AS tmea
		ON tmea.[AttendeeId] = wea.[AttendeeId]
	INNER JOIN [dbo].[VW__TEAM_MEMBERS__UserInfo] AS tmui
		ON tmui.[TeamMemberId] = tmea.[TeamMemberId]
	UNION ALL
	SELECT
		wea.[AttendeeId],
		gea.[GivenName],
		gea.[Surname],
		CAST(COALESCE(gea.[PreferredBoatPositionId], 0) AS TINYINT) AS [PreferrefBoatPositionId],
		CAST(0 AS BIT) AS [IsTeamMember]
	FROM [dbo].[WATER_EVENT_ATTENDEES] AS wea
	INNER JOIN [dbo].[GUEST_EVENT_ATTENDEES] AS gea
		ON gea.[AttendeeId] = wea.[AttendeeId]
