using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace Turis.Common.ScopePermission;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
	private readonly IHttpContextAccessor _httpContextAccessor;
	private readonly IPermissionService _permissionService;

	public PermissionAuthorizationHandler(IHttpContextAccessor httpContextAccessor, IPermissionService permissionService)
	{
		_httpContextAccessor = httpContextAccessor;
		_permissionService = permissionService;
	}

	protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
	{
		if (context.User.Identity.IsAuthenticated)
		{
			var isGranted = await _permissionService.IsGrantedAsync(_httpContextAccessor.HttpContext, requirement.Permissions);

			if (isGranted)
				context.Succeed(requirement);
		}
	}
}