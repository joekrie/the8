CREATE TABLE [Accounts].[Users]
(
	[UserId] INT NOT NULL IDENTITY, 
    [GivenName] NVARCHAR(100) NOT NULL, 
    [Surname] NVARCHAR(100) NOT NULL, 
    [Registered] DATETIME2 NOT NULL, 
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
)