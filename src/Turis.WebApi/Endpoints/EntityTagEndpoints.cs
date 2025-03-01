using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;

namespace Turis.WebApi.Endpoints;

public class EntityTagEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/entity-tag");

		templateApiGroup.MapGet("list", List)
			.Produces<IEnumerable<EntityTagModel>>(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.WithOpenApi();

		templateApiGroup.MapDelete("{id:guid}", Delete)
			.Produces(StatusCodes.Status404NotFound)
			.Produces(StatusCodes.Status204NoContent);

		templateApiGroup.MapDelete("delete-all/{entityName}/{entityKey:guid}", DeleteAll)
			.Produces(StatusCodes.Status404NotFound)
			.Produces(StatusCodes.Status204NoContent);
	}

	private static async Task<IResult> List(HttpContext httpContext, IEntityTagService service, [AsParameters] EntityTagSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, IEntityTagService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> DeleteAll(HttpContext httpContext, IEntityTagService service, string entityName, Guid entityKey)
		=> (await service.DeleteAllAsync(entityName, entityKey)).ToResponse(httpContext);
}