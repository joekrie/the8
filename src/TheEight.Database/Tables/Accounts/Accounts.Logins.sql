CREATE TABLE [Accounts].[Logins]
(
	[UserId] INT NOT NULL, 
    [LoginProviderId] NVARCHAR(25) NOT NULL, 
    [LoginIdentifier] NVARCHAR(500) NOT NULL, 
    CONSTRAINT [PK_Logins] PRIMARY KEY ([LoginProviderId], [UserId]), 
    CONSTRAINT [AK_Logins_LoginProviderId_LoginIdentifier] UNIQUE ([LoginProviderId], [LoginIdentifier]), 
    CONSTRAINT [FK_Logins_LoginProviders] FOREIGN KEY ([LoginProviderId]) REFERENCES [Accounts].[LoginProviders]([LoginProviderId])
)