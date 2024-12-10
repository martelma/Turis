using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IRoleService : IService
{
    Task<Result<PaginatedList<ApplicationRoleModel>>> ListAsync(Guid userId, Guid applicationId, int pageIndex, int itemsPerPage, string orderBy);
    Task<Result<ApplicationRoleModel>> GetAsync(Guid applicationId, Guid roleId);
	Task<Result<ApplicationRoleModel>> GetAsync(Guid applicationId, string roleName);
    Task<Result<ApplicationRoleModel>> SaveAsync(Guid applicationId, ApplicationRoleModel role);
    Task<Result> DeleteAsync(Guid applicationId, Guid roleId);
}