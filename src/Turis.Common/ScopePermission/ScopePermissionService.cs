using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TinyHelpers.Extensions;

namespace Turis.Common.ScopePermission;

public class ScopePermissionService : IPermissionService
{
	public Task<bool> IsGrantedAsync(HttpContext context, IEnumerable<string> requirements)
	{
		var isGranted = false;

		if (!requirements.HasItems())
			isGranted = true;
		else
		{
			var scopeClaim = context.User.FindFirstValue("scope");
			var scopes = scopeClaim?
				.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? Enumerable.Empty<string>();

			isGranted = scopes.Intersect(requirements).HasItems();
		}

		return Task.FromResult(isGranted);
	}
}