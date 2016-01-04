CREATE TABLE [Accounts].[Invites]
(
	[InviteId] INT NOT NULL IDENTITY,	
	[AccessCode] CHAR(24) NOT NULL,
    [Created] DATETIME2 NOT NULL,
	[Expiration] DATETIME2 NOT NULL, 
    [Email] NVARCHAR(150) NOT NULL,
    CONSTRAINT [PK_Invites] PRIMARY KEY ([InviteId]), 
    CONSTRAINT [AK_Invites_AccessCode] UNIQUE ([AccessCode])
)