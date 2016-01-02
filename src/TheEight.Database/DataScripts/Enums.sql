INSERT INTO [Clubs].[SquadMemberRoles] ([SquadMemberRoleId], [Title]) 
VALUES (1, 'rower'),
	   (2, 'coxswain'),
	   (3, 'coach')

INSERT INTO [WaterEvents].[EventModes] ([EventModeId], [Title]) 
VALUES (1, 'practice'),
	   (2, 'race')

INSERT INTO [ErgPractices].[PieceTypes]([PieceType], [Name])
VALUES (1, 'fixed distance'),
	   (2, 'fixed duration')