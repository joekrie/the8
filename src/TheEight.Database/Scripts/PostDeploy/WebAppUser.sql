:setvar LoginName WebApp
:setvar UserName WebApp

ALTER DATABASE [$(DatabaseName)]
SET CONTAINMENT = PARTIAL

GO

IF NOT EXISTS
    (SELECT name
     FROM sys.database_principals
     WHERE name = '$(UserName)')
BEGIN
    CREATE USER [$(UserName)] 
	WITH PASSWORD = '$(WebAppLoginPassword)'
END

GO

GRANT CONNECT TO [$(UserName)]

GO