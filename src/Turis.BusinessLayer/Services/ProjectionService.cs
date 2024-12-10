using OperationResults;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.BusinessLayer.Services;

public class ProjectionService : IProjectionService
{
	public async Task<Result> RebuildAllProjectionsAsync()
	{
		return await Task.FromResult(Result.Ok());
	}
}