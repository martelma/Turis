using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Keyless;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface ITargetService : IService
{
	Task<Result<TargetModel>> GetAsync(Guid id);
	Task<Result<PaginatedList<TargetModel>>> ListAsync(TargetSearchParameters parameters);
	Task<Result<PaginatedList<CommissionStat>>> CommissionStatsAsync(TargetSearchParameters parameters);
	Task<Result> SaveAsync(TargetRequest model);
	Task<Result> DeleteAsync(Guid id);
}