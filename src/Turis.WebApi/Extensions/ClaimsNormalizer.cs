using System.Security.Claims;
using JeMa.Shared.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using TinyHelpers.Extensions;
using Turis.Authentication.Settings;

namespace Turis.WebApi.Extensions;

public class ClaimsNormalizer(IHttpContextAccessor httpContextAccessor, IOptions<AuthenticationSettings> authenticationSettingsOptions) : IClaimsTransformation
{
	private readonly HttpContext httpContext = httpContextAccessor.HttpContext;
	private readonly AuthenticationSettings authenticationSettings = authenticationSettingsOptions.Value;

	public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
	{
		var applicationId = httpContext.Request.Headers[authenticationSettings.ApplicationIdHeaderName].FirstOrDefault().GetValueOrDefault(authenticationSettings.ApplicationId.ToString());
		if (applicationId.HasValue())
		{
			var identity = (ClaimsIdentity)principal.Identity;

			var roles = principal.Claims.Where(c => c.Type == ClaimTypes.Role).ToList();
			var scopes = principal.Claims.Where(c => c.Type == ClaimNames.Scope).ToList();

			foreach (var role in roles)
			{
				// Remove the original role and, if it is related to the current application, replace it with the normalized one (without the ApplicationId prefix).
				identity.RemoveClaim(role);

				if (role.Value.StartsWith(applicationId, StringComparison.InvariantCultureIgnoreCase))
				{
					identity.AddClaim(new(ClaimTypes.Role, role.Value[(role.Value.IndexOf(":") + 1)..]));
				}
			}

			foreach (var scope in scopes)
			{
				// Remove the original scope and, if it is related to the current application, replace it with the normalized one (without the ApplicationId prefix).
				identity.RemoveClaim(scope);

				if (scope.Value.StartsWith(applicationId, StringComparison.InvariantCultureIgnoreCase))
				{
					identity.AddClaim(new(ClaimNames.Scope, scope.Value[(scope.Value.IndexOf(":") + 1)..]));
				}
			}
		}

		return Task.FromResult(principal);
	}
}
