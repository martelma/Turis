using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IRoleService : IService
{
	Task<Result<PaginatedList<ApplicationRoleModel>>> ListAsync(Guid userId, int pageIndex, int itemsPerPage, string orderBy);
	Task<Result<PaginatedList<ApplicationRoleModel>>> UserRolesAsync(Guid userId, int pageIndex, int itemsPerPage, string orderBy);
	Task<Result<ApplicationRoleModel>> GetAsync(Guid roleId);
	Task<Result<ApplicationRoleModel>> GetAsync(string roleName);
	Task<Result<ApplicationRoleModel>> SaveAsync(ApplicationRoleRequest role);
	Task<Result> DeleteAsync(Guid roleId);
}