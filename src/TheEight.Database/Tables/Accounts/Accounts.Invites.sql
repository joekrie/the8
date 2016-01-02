CREATE TABLE [Accounts].[Invites]
(
	[InviteId] INT NOT NULL IDENTITY,
    [Email] NVARCHAR(150) NOT NULL,
    [Created] DATETIME2 NOT NULL,
    [IsAdmin] BIT NOT NULL, 
    CONSTRAINT [PK_Invites] PRIMARY KEY ([InviteId])
)