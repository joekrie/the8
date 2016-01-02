CREATE TABLE [Messaging].[Messages]
(
	[MessageId] INT NOT NULL IDENTITY, 
	[Created] DATETIME2 NOT NULL, 
    CONSTRAINT [PK_Messages] PRIMARY KEY ([MessageId])
)