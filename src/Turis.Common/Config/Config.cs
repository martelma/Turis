using StackExchange.Redis;
using StackExchange.Redis.Extensions.Core.Abstractions;

namespace Turis.Common.Config;

public static class Config
{
    public static DataModel DataModel { get; set; }
    public static IRedisCacheClient RedisCache;

    public static int RedisDbNumber { get; set; }
    public static IRedisDatabase IRedisDatabase => RedisCache.GetDb(RedisDbNumber);
    public static IServer RedisServer => RedisDatabase.Multiplexer.GetServer(RedisConnectionString);
    public static IDatabase RedisDatabase => RedisCache.GetDb(RedisDbNumber).Database;
    public static string RedisConnectionString { get; set; }
}