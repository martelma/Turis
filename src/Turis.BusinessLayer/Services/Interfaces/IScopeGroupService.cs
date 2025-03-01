using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IScopeGroupService : IService
{
    Task<Result<PaginatedList<ApplicationScopeGroupModel>>> ListAsync(bool includeScopes, int pageIndex,
	    int itemsPerPage, string orderBy);

    Task<Result<ApplicationScopeGroupModel>> GetAsync(Guid scopeGroupId, bool includeScopes);

    Task<Result> SaveAsync(ApplicationScopeGroupRequest scopeGroup);

    Task<Result> DeleteAsync(Guid scopeGroupId);
}