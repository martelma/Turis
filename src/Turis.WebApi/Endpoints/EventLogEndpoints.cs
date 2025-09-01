using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.WebApi.Endpoints;

public class EventLogEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/event-logs");

		templateApiGroup.MapGet("{entityName}/{entityKey}", List);
	}

	private static async Task<IResult> List(HttpContext httpContext, IEventLogService service, string entityName, string entityKey)
		=> (await service.ListAsync(entityName, entityKey)).ToResponse(httpContext);
}