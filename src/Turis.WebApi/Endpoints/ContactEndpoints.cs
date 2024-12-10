using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;

namespace Turis.WebApi.Endpoints;

public class ContactEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/contact");

		templateApiGroup.MapGet("{id:guid}", Get);
		templateApiGroup.MapGet(string.Empty, List);
		templateApiGroup.MapGet("filter-clients/{pattern}", FilterClients);
		templateApiGroup.MapGet("filter-collaborators/{pattern}", FilterCollaborators);
		templateApiGroup.MapPost(string.Empty, Save);
		templateApiGroup.MapPut(string.Empty, Save);
		templateApiGroup.MapDelete("{id:guid}", Delete);
	}

	private static async Task<IResult> Get(HttpContext httpContext, IContactService service, Guid id)
		=> (await service.GetAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> List(HttpContext httpContext, IContactService service, [AsParameters] ContactSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> FilterClients(HttpContext httpContext, IContactService service, string pattern)
		=> (await service.FilterClients(pattern)).ToResponse(httpContext);

	private static async Task<IResult> FilterCollaborators(HttpContext httpContext, IContactService service, string pattern)
		=> (await service.FilterCollaborators(pattern)).ToResponse(httpContext);

	private static async Task<IResult> Save(HttpContext httpContext, IContactService service, ContactRequest model)
		=> (await service.SaveAsync(model)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, IContactService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);
}