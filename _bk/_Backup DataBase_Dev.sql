BACKUP DATABASE [Turis] 
TO DISK = N'C:\Mario\Progetti\Turis\_bk\Turis_Dev.bak' 
WITH NOFORMAT, INIT,  
NAME = N'Turis-Full Database Backup', 
SKIP, NOREWIND, NOUNLOAD,  STATS = 10
GO
