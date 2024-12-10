namespace Turis.WebApi.Filters;

public class HangFireAuthorizationFilter : IDashboardAuthorizationFilter
{
	public bool Authorize(DashboardContext context)
	{
		var httpContext = context.GetHttpContext();

		var authorizationService = httpContext.RequestServices.GetService<ExternalDashboardAuthorizationService>();

		return authorizationService.CheckAuthorization(httpContext, "HangFireCookieName");
	}
}