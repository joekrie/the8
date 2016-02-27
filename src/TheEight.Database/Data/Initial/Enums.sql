INSERT INTO [Clubs].[SquadMemberRoles] ([SquadMemberRoleId], [Title]) 
VALUES (1, 'rower'),
	   (2, 'coxswain'),
	   (3, 'coach')


INSERT INTO [WaterEvents].[EventModes] ([EventModeId], [Title]) 
VALUES (1, 'practice'),
	   (2, 'race')


INSERT INTO [ErgWorkouts].[PieceTypes] ([PieceTypeId], [Name])
VALUES (1, 'fixed distance'),
	   (2, 'fixed duration')


INSERT INTO [Accounts].[LoginProviders] ([LoginProviderId], [Name])
VALUES (1, 'Google'),
	   (2, 'Facebook')


INSERT INTO [Security].[ClubRoles] ([ClubRoleId], [Name], [Description])
VALUES (1, '', '')


INSERT INTO [Security].[SquadRoles] ([SquadRoleId], [Name], [Description])
VALUES (1, 'rower', ''),
       (2, 'coxswain', ''),
	   (3, 'coach', '')