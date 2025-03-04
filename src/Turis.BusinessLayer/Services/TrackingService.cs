using StackExchange.Redis;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.BusinessLayer.Services;

public class TrackingService(RedisService redisService, IUserService userService) : ITrackingService
{
	private const long MaxItems = 20;

	private string SortedSetKey => $"{userService.GetUserName()}:tracking_links";

	public async Task AddOrUpdate(string entityName, Guid entityKey)
	{
		var timestamp = DateTimeOffset.UtcNow;
		var trackingItem = new TrackingItem
		{
			EntityName = entityName,
			EntityKey = entityKey,

			//se metto questo mi introduci duplicazione di dati perché il timestamp è sempre diverso
			//Timestamp = timestamp
		};

		await redisService.RedisDb.SortedSetAddAsync(SortedSetKey, trackingItem.ToJson(), timestamp.ToUnixTimeSeconds());

		// Rimuove gli elementi in eccesso se il numero massimo è superato
		if (redisService.RedisDb.SortedSetLength(SortedSetKey) > MaxItems)
			redisService.RedisDb.SortedSetRemoveRangeByRank(SortedSetKey, 0, 0);
	}

	public async Task<List<TrackingItem>> LastEntries(int count)
	{
		var result = new List<TrackingItem>();
		var entries = await redisService.RedisDb.SortedSetRangeByRankWithScoresAsync(SortedSetKey, 0, count - 1, Order.Descending);
		foreach (var entry in entries)
		{
			var trackingItem = entry.Element.FromJsonOrDefault<TrackingItem>();
			trackingItem.Timestamp = DateTimeOffset.FromUnixTimeSeconds((long)entry.Score);
			result.Add(trackingItem);
		}
		return result;
	}
}

public class TrackingItem
{
	public string EntityName { get; set; }
	public Guid EntityKey { get; set; }
	public DateTimeOffset Timestamp { get; set; }
}