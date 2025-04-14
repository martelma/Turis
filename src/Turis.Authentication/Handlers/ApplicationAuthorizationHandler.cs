using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using TinyHelpers.Extensions;
using Turis.Authentication.Settings;

namespace Turis.Authentication.Handlers;

public class ApplicationAuthorizationHandler(IHttpContextAccessor httpContextAccessor, IOptions<AuthenticationSettings> authenticationSettingsOptions) : AuthorizationHandler<ApplicationRequirement>
{
	private readonly HttpContext httpContext = httpContextAccessor.HttpContext;
	private readonly AuthenticationSettings authenticationSettings = authenticationSettingsOptions.Value;

	protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ApplicationRequirement requirement)
	{
		var applicationId = httpContext.Request.Headers[authenticationSettings.ApplicationIdHeaderName].FirstOrDefault().GetValueOrDefault(authenticationSettings.ApplicationId.ToString());
		if (applicationId == requirement.ApplicationId.ToString())
		{
			context.Succeed(requirement);
		}

		return Task.CompletedTask;
	}
}
