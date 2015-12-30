CREATE TABLE [Accounts].[Users]
(
	[UserId] INT NOT NULL PRIMARY KEY IDENTITY, 
    [GivenName] NVARCHAR(100) NOT NULL, 
    [Surname] NVARCHAR(100) NOT NULL, 
    [Registered] DATETIME2 NOT NULL
)
