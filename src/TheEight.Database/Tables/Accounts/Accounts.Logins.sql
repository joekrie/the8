CREATE TABLE [Accounts].[Logins]
(
	[UserId] INT NOT NULL, 
    [LoginProvider] NVARCHAR(100) NOT NULL, 
    [Identifier] NVARCHAR(500) NOT NULL, 
    CONSTRAINT [PK_Logins] PRIMARY KEY ([LoginProvider], [UserId]), 
    CONSTRAINT [AK_Logins_LoginProviderId_Identifier] UNIQUE ([LoginProvider], [Identifier])
)