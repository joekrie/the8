/*
'ffdebfab-fdaa-4d2b-af8d-313c5cc8fbaa'
'e4ad20b3-2915-42cb-92a1-9660ade80d6b'
'1c4b4e32-f72d-4db1-84d0-63aa44984c48'
'73cd8c6b-2741-43b0-8e93-5e8bba230685'
*/


INSERT INTO BOAT_POSITIONS (BoatPositionId, Name)
VALUES	(0, 'None'), (1, 'Coxswain'), (2, 'PortRower'), (3, 'StarboardRower'), (4, 'BisweptualRower')

INSERT INTO TEAM_ROLES (TeamRoleId, Name)
VALUES	(0, 'None'), (1, 'Rower'), (2, 'Coxswain'), (4, 'Coach'), (8, 'Captain')

INSERT INTO WATER_EVENT_MODES
VALUES	(0, 'None'), (1, 'PracticeMode'), (2, 'RaceMode')

INSERT INTO CLUBS (ClubId, Name) 
VALUES	('8f12d8dc-1bc6-49e6-a45d-dffee5840b13', 'Rocky Road Rowers')

INSERT INTO TEAMS (TeamId, ClubId, Name, StartDate) 
VALUES	('aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13', 'Rec Men 2016', '2016-01-01')

INSERT USERS (UserId, AzureAdObjectId, GivenName, Surname) 
VALUES	('4d9de1c7-5413-49ce-95bc-2c95483f75ef', 'b05367f3-8e73-496e-a428-ba9e6d2a4b39', 'Jimmy', 'Smith'),
		('66683d47-75fe-43f9-998d-ef0842df3375', 'dd86a429-cbf4-4712-8bb4-4a4c7733555c', 'Bill', 'Peach')

INSERT INTO CLUB_MEMBERS (UserId, ClubId)
VALUES	('4d9de1c7-5413-49ce-95bc-2c95483f75ef', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13'),
		('66683d47-75fe-43f9-998d-ef0842df3375', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13')

INSERT INTO TEAM_MEMBERS (UserId, ClubId, TeamId, PreferredBoatPositionId)
VALUES	('4d9de1c7-5413-49ce-95bc-2c95483f75ef', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13', 'aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56', 2),
		('66683d47-75fe-43f9-998d-ef0842df3375', '8f12d8dc-1bc6-49e6-a45d-dffee5840b13', 'aed1e1cd-c9cf-45d7-94cf-b7c6932d2c56', 3)
