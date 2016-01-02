CREATE PROCEDURE [Accounts].[GetUserIdByLogin]
	@LoginProvider nvarchar(100),
	@Identifier nvarchar(300)
AS
	SELECT [UserId]
	FROM [Accounts].[Logins]
	WHERE [LoginProvider] = @LoginProvider
		AND [Identifier] = @Identifier
RETURN 0