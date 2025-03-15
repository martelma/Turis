using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;

namespace Turis.WebApi.Endpoints;

public class TagEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/tag");

		templateApiGroup.MapGet("{id:guid}", Get);
		templateApiGroup.MapGet(string.Empty, List);
		templateApiGroup.MapPost(string.Empty, Save);
		templateApiGroup.MapPut(string.Empty, Save);
		templateApiGroup.MapDelete("{id:guid}", Delete);
	}

	private static async Task<IResult> Get(HttpContext httpContext, ITagService service, Guid id)
		=> (await service.GetAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> List(HttpContext httpContext, ITagService service, [AsParameters] TagSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Save(HttpContext httpContext, ITagService service, TagRequest model)
		=> (await service.SaveAsync(model)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, ITagService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);
}