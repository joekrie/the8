INSERT INTO [Clubs].[SquadMemberRoles] ([SquadMemberRoleId], [Title]) 
VALUES	
	(1, 'rower'),
	(2, 'coxswain'),
	(3, 'coach')

INSERT INTO [WaterEvents].[EventModes] ([EventModeId], [Title]) 
VALUES 
	(1, 'practice'),
	(2, 'race')


INSERT INTO [Accounts].[Users] ([GivenName], [Surname], [Registered])
VALUES ('Joe', 'Kriefall', '2015-12-27')