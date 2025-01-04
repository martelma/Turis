namespace Turis.Common;

public class Constants
{
	public const string ApplicationName = "Turis";
	public const string RoleAdmin = "Admin";
	public const string DefaultPassword = "Abc.123";
	public static TimeZoneInfo DefaultTimeZoneInfo => TimeZoneInfo.FindSystemTimeZoneById("W. Europe Standard Time");

	//costanti utilizzate per la gestione di Redis
	public const int BatchSize = 20000;
	public const string RedisKeyPrefix = "turis";
	public const string PrefixEntityKey = "turis:obj";
	public const string PrefixIndexKey = "turis:idx";
	public const string PrefixIndexSortedKey = "turis:idx";

	public const string CodiceFattura = "F";
	public const string CodiceNotaDiCredito = "N";

	public const string UserSettings = "turis:UserSettings";

	//workaround perché non è possibile definire una costante di tipo DateTime
	public static readonly DateTime BaseDate = new DateTime(1970, 1, 1, 0, 0, 0);
}