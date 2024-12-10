using Microsoft.AspNetCore.Http;

namespace Turis.Common.ScopePermission;

public interface IPermissionService
{
	Task<bool> IsGrantedAsync(HttpContext context, IEnumerable<string> requirements);
}