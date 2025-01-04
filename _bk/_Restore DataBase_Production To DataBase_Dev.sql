USE [master]
ALTER DATABASE [Turis] SET SINGLE_USER WITH ROLLBACK IMMEDIATE

RESTORE DATABASE [Turis] 
FROM  DISK = N'C:\Mario\Progetti\Turis\_bk\Turis_Production.bak' WITH  FILE = 1,  
MOVE N'Turis' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MM2022\MSSQL\DATA\Turis.mdf',  
MOVE N'Turis_log' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MM2022\MSSQL\DATA\Turis_log.ldf',  
NOUNLOAD,  REPLACE,  STATS = 5

ALTER DATABASE [Turis] SET MULTI_USER

/*
USE [Turis]
GO
--per fixare l'utente già esistente 
EXEC sp_change_users_login 'Auto_Fix', 'Turis', NULL, 'Turis';  

GO
*/
