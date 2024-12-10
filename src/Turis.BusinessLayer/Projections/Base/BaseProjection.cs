namespace Turis.BusinessLayer.Projections.Base;

public abstract class BaseProjection : IProjection
{
	protected readonly RedisService RedisService;

	protected BaseProjection(RedisService redisService)
	{
		RedisService = redisService;
	}

	public Task Clear()
	{
		throw new System.NotImplementedException();
	}

	public Task Init()
	{
		throw new NotImplementedException();
	}
}