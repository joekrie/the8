
/*
'ffdebfab-fdaa-4d2b-af8d-313c5cc8fbaa'
'e4ad20b3-2915-42cb-92a1-9660ade80d6b'
'1c4b4e32-f72d-4db1-84d0-63aa44984c48'
'73cd8c6b-2741-43b0-8e93-5e8bba230685'
'c6ea7e2b-9fc6-434a-8747-4978c95b3e00'
'177027a0-6fd8-40fa-aef8-77c5724f2115'
*/

INSERT INTO [dbo].[CLUBS]
		([ClubId],									[Name],					[UrlName]) 
VALUES	('8f12d8dc-1bc6-49e6-a45d-dffee5840b13',	'Rocky Road Rowers',	'rocky-road-rowers')

INSERT INTO [dbo].[TEAMS]
		([TeamId],									[ClubId],								[Name],				[StartDate]) 
VALUES	('aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56',	'8f12d8dc-1bc6-49e6-a45d-dffee5840b13', 'Rec Men 2016',		'2016-01-01'),
		('6cd7cefb-def0-4676-8fae-6c054b93a023',	'8f12d8dc-1bc6-49e6-a45d-dffee5840b13', 'Rec Women 2016',	'2016-01-01')

INSERT INTO [dbo].[USERS]
		([UserId],									[AzureAdObjectId],						[GivenName],	[Surname]) 
VALUES	('4d9de1c7-5413-49ce-95bc-2c95483f75ef',	'b05367f3-8e73-496e-a428-ba9e6d2a4b39', 'Jimmy',		'Smith'),
		('66683d47-75fe-43f9-998d-ef0842df3375',	'dd86a429-cbf4-4712-8bb4-4a4c7733555c', 'Bill',			'Peach')

INSERT INTO [dbo].[CLUB_MEMBERS]
		([ClubMemberId],							[UserId],								[ClubId])
VALUES	('195c0097-0d72-4066-bc95-318edfb58f74',	'4d9de1c7-5413-49ce-95bc-2c95483f75ef', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13'),
		('48f8715a-0b6e-4b48-a7e8-033b790da037',	'66683d47-75fe-43f9-998d-ef0842df3375', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13')

INSERT INTO [dbo].[TEAM_MEMBERS]
		([TeamMemberId],							[ClubMemberId],							[TeamId],								[PreferredBoatPositionId])
VALUES	('cf4013a6-540f-4b9b-abed-e5996586e6c3',	'195c0097-0d72-4066-bc95-318edfb58f74', 'aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56', 2),
		('87d50597-00ae-49a9-8677-9b2c4f223732',	'48f8715a-0b6e-4b48-a7e8-033b790da037', 'aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56', 3)

INSERT INTO [dbo].[EVENTS]
		([EventId],									[TeamId],								[Date])
VALUES	('699858c5-9050-4ef1-84ac-60ceb461ecc9',	'aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56',	'2016-07-05')

INSERT INTO [dbo].[WATER_EVENTS]
		([EventId],									[WaterEventModeId])
VALUES	('699858c5-9050-4ef1-84ac-60ceb461ecc9',	1)

INSERT INTO [dbo].[EVENT_ATTENDEES]
		([AttendeeId],								[EventId])
VALUES	('bf5fc7d6-9525-4857-b89e-385f5ff18fe9',	'699858c5-9050-4ef1-84ac-60ceb461ecc9')

INSERT INTO [dbo].[TEAM_MEMBER_EVENT_ATTENDEES]
		([AttendeeId],								[TeamMemberId])
VALUES	('bf5fc7d6-9525-4857-b89e-385f5ff18fe9',	'cf4013a6-540f-4b9b-abed-e5996586e6c3')

INSERT INTO [dbo].[WATER_EVENT_BOATS]
		([BoatId],									[WaterEventId],							[Name],			[IsCoxed],	[SeatCount])
VALUES	('cbd76320-2070-4dee-826e-ea44e56e0c16',	'699858c5-9050-4ef1-84ac-60ceb461ecc9',	'Voyageur I',	1,			4)

INSERT INTO [dbo].[WATER_EVENT_PLACEMENTS]
		([AttendeeId],								[BoatId],								[SeatNumber])
VALUES	('bf5fc7d6-9525-4857-b89e-385f5ff18fe9',	'cbd76320-2070-4dee-826e-ea44e56e0c16',	2)
