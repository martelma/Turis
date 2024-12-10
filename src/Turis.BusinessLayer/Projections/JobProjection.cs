using StackExchange.Redis;
using Turis.BusinessLayer.Projections.Base;
using Turis.Common;

namespace Turis.BusinessLayer.Projections;

public class JobProjection : BaseProjection
{
	public JobProjection(RedisService redisService) : base(redisService)
	{

	}

	public virtual async Task Clear()
	{
		//await RedisService.RedisDb.KeyDeleteAsync(Key());
		var keys = (await RedisService.RedisDb.HashKeysAsync(Key())).ToArray();
		await RedisService.RedisDb.HashDeleteAsync(Key(), keys);
		await RedisService.RedisDb.HashDeleteAsync(HashKeyAll, "jobs");
	}

	public async Task Add(string correlationId, JobInfo jobInfo)
	{
		Save(correlationId, jobInfo);
		await AddToList(jobInfo);
	}

	public async Task Complete(string correlationId, JobInfo jobInfo)
	{
		Save(correlationId, jobInfo);
		await RemoveToList(jobInfo);
	}

	private void Save(string correlationId, JobInfo jobInfo)
	{
		RedisService.RedisDb.HashSet(Key(), correlationId, jobInfo.ToJsonString());
	}

	private async Task AddToList(JobInfo jobInfo)
	{
		var list = LookupAll() ?? new List<JobInfo>();
		list.Add(jobInfo);
		await SaveAll(list);
	}

	private async Task RemoveToList(JobInfo jobInfo)
	{
		var list = LookupAll() ?? new List<JobInfo>();
		list.RemoveAll(x => x.JobId == jobInfo.JobId);
		await SaveAll(list);
	}

	public async Task SaveAll(List<JobInfo> list)
	{
		await RedisService.RedisDatabase.HashSetAsync(HashKeyAll, "jobs", list);
	}

	public JobInfo Lookup(string correlationId)
	{
		return RedisService.RedisDb
			.HashGet(Key(), correlationId)
			.FromJsonOrDefault<JobInfo>();
	}

	public List<JobInfo> LookupAll()
	{
		return RedisService.RedisDb.HashGet(HashKeyAll, "jobs").FromJsonOrDefault<List<JobInfo>>();
	}

	static RedisKey Key() => $"{Constants.RedisKeyPrefix}:job";
	string HashKeyAll => RedisService.DataModel.GetEntityKeyAll;
}

public class JobInfo
{
	public string JobId { get; set; }
	public DateTime Start { get; set; }
	public DateTime End { get; set; }
	public string Status { get; set; }
	public string UserName { get; set; }
	public string CorrelationKey { get; set; }
	public string CorrelationId { get; set; }
	public CustomKey CustomKey1 { get; set; }
	public CustomKey CustomKey2 { get; set; }
	public CustomKey CustomKey3 { get; set; }
}

public class CustomKey
{
	public string Id { get; set; }
	public string Key { get; set; }
	public object Value { get; set; }

	public CustomKey()
	{
		
	}

	public CustomKey(string id, string key, object value)
	{
		Id = id;
		Key = key;
		Value = value;
	}

	public CustomKey(ProcessViewModel process)
	{
		Id = process.Id;
		Key = "Process";
		Value = process.Code;
	}

	public CustomKey(DrawingArchiveViewModel drawingArchive)
	{
		Id = drawingArchive.Id;
		Key = "DrawingArchive";
		Value = drawingArchive.Code;
	}

	public CustomKey(SegmentViewModel segment)
	{
		Id = segment.Id;
		Key = "Segment";
		Value = segment.Code;
	}
}