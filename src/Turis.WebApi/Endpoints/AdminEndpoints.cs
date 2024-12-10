using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.WebApi.Endpoints;

public class AdminEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/admin");

		templateApiGroup.MapGet("backend-configuration", BackendConfiguration);

		templateApiGroup.MapPost("truncate-elmah", TruncateElmah);
		templateApiGroup.MapPost("rebuild-all-projections", RebuildAllProjections);
    }

    private static async Task<IResult> BackendConfiguration(HttpContext httpContext, IAdminService service)
        => (await service.GetBackendConfiguration()).ToResponse(httpContext);

	private static async Task<IResult> TruncateElmah(HttpContext httpContext, IAdminService service)
		=> (await service.TruncateElmah()).ToResponse(httpContext);

	private static async Task<IResult> RebuildAllProjections(HttpContext httpContext, IProjectionService service)
        => (await service.RebuildAllProjectionsAsync()).ToResponse(httpContext);
}