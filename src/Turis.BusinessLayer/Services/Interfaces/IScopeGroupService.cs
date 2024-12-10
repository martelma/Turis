using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IScopeGroupService : IService
{
    Task<Result<PaginatedList<ApplicationScopeGroupModel>>> ListAsync(Guid applicationId, bool includeScopes, int pageIndex, int itemsPerPage, string orderBy);

    Task<Result<ApplicationScopeGroupModel>> GetAsync(Guid applicationId, Guid scopeGroupId, bool includeScopes);

    Task<Result<ApplicationScopeGroupModel>> SaveAsync(Guid applicationId, ApplicationScopeGroupModel scopeGroup);

    Task<Result> DeleteAsync(Guid applicationId, Guid scopeGroupId);
}