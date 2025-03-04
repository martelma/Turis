using StackExchange.Redis;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface ITrackingService : IService
{
	Task AddOrUpdate(string entityName, Guid entityKey);
	Task<List<TrackingItem>> LastEntries(int count);
}
