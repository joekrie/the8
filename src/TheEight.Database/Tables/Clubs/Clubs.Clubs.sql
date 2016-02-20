CREATE TABLE [Clubs].[Clubs]
(
	[ClubId] INT NOT NULL  IDENTITY, 
	[Name] NVARCHAR(50) NOT NULL, 
	[TimeZone] NVARCHAR(50) NOT NULL, 
	[UrlFriendlyName] NVARCHAR(50) NOT NULL, 
	[SmsPhoneNumber] NVARCHAR(50) NOT NULL, 
	[Active] BIT NOT NULL, 
	[Development] BIT NOT NULL, 
    CONSTRAINT [PK_Clubs] PRIMARY KEY ([ClubId])
)