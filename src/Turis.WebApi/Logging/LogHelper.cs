using System.Diagnostics;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using Serilog;
using TinyHelpers.Extensions;
using Turis.Authentication.Settings;

namespace Turis.WebApi.Logging;

public static class LogHelper
{
	public static void EnrichFromRequest(IDiagnosticContext diagnosticContext, HttpContext httpContext)
	{
		var request = httpContext.Request;
		diagnosticContext.Set("UserName", httpContext.User.Identity?.Name);

		if (request.QueryString.HasValue && request.QueryString.Value != "?")
		{
			diagnosticContext.Set("QueryString", request.QueryString.Value);
		}

		var authenticationSettings = httpContext.RequestServices.GetRequiredService<IOptions<AuthenticationSettings>>().Value;
		var applicationId = httpContext.Request.Headers[authenticationSettings.ApplicationIdHeaderName].FirstOrDefault().GetValueOrDefault(authenticationSettings.ApplicationId?.ToString());
		if (applicationId.HasValue())
		{
			diagnosticContext.Set("ApplicationId", applicationId);
		}

		var culture = httpContext.Features.Get<IRequestCultureFeature>()?.RequestCulture.Culture;
		diagnosticContext.Set("Language", culture ?? Thread.CurrentThread.CurrentCulture);

		// Retrieve the IEndpointFeature selected for the request
		var endpoint = httpContext.GetEndpoint();
		diagnosticContext.Set("EndpointName", endpoint?.DisplayName);

		var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;
		if (!string.IsNullOrWhiteSpace(traceId))
		{
			diagnosticContext.Set("TraceId", traceId);
		}
	}
}
