using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IScopeService : IService
{
	Task<Result<PaginatedList<ApplicationScopeModel>>> ListAsync(Guid? roleId, int pageIndex, int itemsPerPage, string orderBy);
	Task<Result<ApplicationScopeModel>> GetAsync(Guid scopeId);
	Task<Result<ApplicationScopeModel>> SaveAsync(ApplicationScopeRequest scope);
	Task<Result> DeleteAsync(Guid scopeId);
}