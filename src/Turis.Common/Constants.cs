namespace Turis.Common;

public class Constants
{
	public const string ApplicationName = "Turis";
	public const string RoleAdmin = "Admin";
	public const string DefaultPassword = "Abc.123";
	public static TimeZoneInfo DefaultTimeZoneInfo => TimeZoneInfo.FindSystemTimeZoneById("W. Europe Standard Time");

	//costanti utilizzate per la gestione di Redis
	public const int BatchSize = 20000;
	public const string RedisKeyPrefix = "box";
	public const string PrefixEntityKey = "box:obj";
	//public const string PrefixIndexPrimaryKey = "box:obj:pk";
	public const string PrefixIndexKey = "box:idx";
	public const string PrefixIndexSortedKey = "box:idx";

	//workaround perché non è possibile definire una costante di tipo DateTime
	public static readonly DateTime BaseDate = new DateTime(1970, 1, 1, 0, 0, 0);
}