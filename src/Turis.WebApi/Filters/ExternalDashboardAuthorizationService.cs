namespace Turis.WebApi.Filters;

public class ExternalDashboardAuthorizationService
{
	public bool CheckAuthorization(HttpContext httpContext, string cookieName)
	{
		var securityCode = httpContext.Request.Query["securityCode"];
		if (securityCode == StringValues.Empty)
			securityCode = httpContext.Request.Cookies[cookieName];

		var timeLimitedDataProtector = httpContext.RequestServices.GetService<ITimeLimitedDataProtector>();
		try
		{
			var userId = timeLimitedDataProtector.Unprotect(securityCode);

			//se sono qui allora il security code è giusto e ancora valido.
			//ma voglio rendere accessibile la dashboard ai soli amministratori

			var roles = GetUserRoles(httpContext, userId);

			var isAuthenticated = roles.Contains(Constants.RoleAdmin);
			if (isAuthenticated)
			{
				httpContext.Response.Cookies.Append(cookieName,
					securityCode,
					new CookieOptions
					{
						Expires = DateTime.Now.AddMonths(1)
					});
			}

			return isAuthenticated;
		}
		catch (Exception ex)
		{
			return false;
		}
	}

	private static List<string> GetUserRoles(HttpContext httpContext, string userId)
	{
		var memoryCache = httpContext.RequestServices.GetService<IMemoryCache>();

		var userRoles = memoryCache.GetOrCreate($"userRoles-{userId}", entry =>
		{
			var authenticationDbContext = httpContext.RequestServices.GetService<ApplicationDbContext>();
			var roles = authenticationDbContext.UserRoles
				.Where(x => x.User.Id == userId)
				.Select(x => x.Role.Name)
				.ToList();

			entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
			return roles;
		});

		return userRoles;
	}
}