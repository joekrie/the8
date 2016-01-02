CREATE TABLE [Messaging].[LongMessages]
(
	[MessageId] INT NOT NULL, 
    [Subject] NVARCHAR(100) NOT NULL, 
    [Body] NVARCHAR(MAX) NOT NULL, 
    CONSTRAINT [FK_LongMessages_Messages] FOREIGN KEY ([MessageId]) REFERENCES [Messaging].[Messages]([MessageId]), 
    CONSTRAINT [PK_LongMessages] PRIMARY KEY ([MessageId])
)