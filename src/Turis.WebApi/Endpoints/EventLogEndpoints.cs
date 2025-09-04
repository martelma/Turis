using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.WebApi.Endpoints;

public class EventLogEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/event-logs");

		templateApiGroup.MapGet("list", List);
	}

	private static async Task<IResult> List(HttpContext httpContext, IEventLogService service, [AsParameters] EventLogSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);
}