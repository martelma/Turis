using Microsoft.Extensions.Options;
using StackExchange.Redis;
using StackExchange.Redis.Extensions.Core.Abstractions;
using StackExchange.Redis.Extensions.Core.Configuration;

namespace Turis.Common.Services;

public class RedisService(IOptions<RedisConfiguration> redisConfigurationOptions, IRedisClient redisClient)
{
	private readonly RedisConfiguration _redisConfiguration = redisConfigurationOptions.Value;

	public int RedisDbNumber => _redisConfiguration.Database;

	public string ConnectionString => _redisConfiguration.ConfigurationOptions.EndPoints[0].ToString().Replace("Unspecified/", "");

	public IServer RedisServer => RedisDb.Multiplexer.GetServer(ConnectionString);

	public IRedisDatabase RedisDatabase => redisClient.GetDb(RedisDbNumber);

	public IDatabase RedisDb => RedisDatabase.Database;

	public async Task<bool> HashIncrement(IBatch batch, string key, string field, double value = 1)
	{
		var result = await batch.HashIncrementAsync(key, field, value);
		return await Task.FromResult(true);
	}

	public async Task<bool> SortedSetAdd(IBatch batch, string key, RedisValue value, double score)
	{
		return await batch.SortedSetAddAsync(key, value, score);
	}

	public async Task<bool> KeyDeleteAsync(IBatch batch, string key)
	{
		return await batch.KeyDeleteAsync(key);
	}

	public async Task<bool> KeyRenameAsync(IBatch batch, RedisKey key, string newKey)
	{
		return await batch.KeyRenameAsync(key, newKey);
	}

	public async Task HashAddAsync(string key, string field, string value)
	{
		await RedisDb.HashSetAsync(key, field, value);
	}

	public async Task<RedisValue> HashGetAsync(string key, string field)
	{
		return await RedisDb.HashGetAsync(key, field);
	}
}