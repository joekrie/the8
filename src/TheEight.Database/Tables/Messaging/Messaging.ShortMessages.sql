CREATE TABLE [Messaging].[ShortMessages]
(
	[MessageId] INT NOT NULL PRIMARY KEY, 
    [Content] NVARCHAR(140) NOT NULL, 
    CONSTRAINT [FK_ShortMessages_Messages] FOREIGN KEY ([MessageId]) REFERENCES [Messaging].[Messages]([MessageId])
)