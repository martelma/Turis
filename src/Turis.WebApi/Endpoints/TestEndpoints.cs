using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.WebApi.Endpoints;

public class TestEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/test");

		templateApiGroup.MapGet("CreateSecurityCode", CreateSecurityCode).AllowAnonymous();
		//templateApiGroup.MapGet("user", GetUser);
	}

	private static async Task<IResult> CreateSecurityCode(HttpContext httpContext, IAuthService authService) 
		=> (await authService.CreateSecurityCodeAsync()).ToResponse(httpContext);

	//private static async Task<IResult> GetUser(HttpContext httpContext, IAuthService authService)
	//{
	//	var userAsync = await authService.GetUserAsync("02ACC8D1-BA0D-4379-90DF-08DA9C89C10B".ToGuid());
	//	return userAsync.ToResponse(httpContext);
	//}
}