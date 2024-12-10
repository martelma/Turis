using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IScopeService : IService
{
    Task<Result<PaginatedList<ApplicationScopeModel>>> ListAsync(Guid applicationId, Guid? roleId, int pageIndex, int itemsPerPage, string orderBy);

    Task<Result<ApplicationScopeModel>> GetAsync(Guid applicationId, Guid scopeId);

    Task<Result<ApplicationScopeModel>> SaveAsync(Guid applicationId, ApplicationScopeModel scope);

    Task<Result> DeleteAsync(Guid applicationId, Guid scopeId);
}