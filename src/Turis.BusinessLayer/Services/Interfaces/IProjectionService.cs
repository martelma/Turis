using OperationResults;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IProjectionService : IService
{
	//Task RebuildSBoxProductionProjectionCascadeOnPlanning();
	//Task SerialChanged(IEnumerable<string> serialIds);
	Task<Result> RebuildAllProjectionsAsync();
}