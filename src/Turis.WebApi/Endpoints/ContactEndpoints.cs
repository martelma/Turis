using Microsoft.AspNetCore.Mvc;
using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
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
		templateApiGroup.MapGet("collaborators-with-monitor", CollaboratorsWithMonitor);
		templateApiGroup.MapGet("unbilled-list", UnbilledSummaryAsync);
		templateApiGroup.MapPost(string.Empty, Save);
		templateApiGroup.MapPut(string.Empty, Save);
		templateApiGroup.MapDelete("{id:guid}", Delete);

		var avatarsApiGroup = endpoints.MapGroup("/api/contact/{id:guid}/avatar");

		templateApiGroup.MapGet("team-summary", TeamSummaryAsync)
			.Produces<PaginatedList<TeamSummaryModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the team summary";

				operation.Response(StatusCodes.Status200OK).Description = "The team summary";

				return operation;
			});

		avatarsApiGroup.MapGet(string.Empty, GetAvatarAsync)
			.AllowAnonymous()
			.Produces<FileContentResult>(StatusCodes.Status200OK)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Get the contact's avatar";

				operation.Response(StatusCodes.Status200OK).Description = "The contact's avatar";
				operation.Response(StatusCodes.Status404NotFound).Description = "Avatar not found";

				return operation;
			});

		avatarsApiGroup.MapPost(string.Empty, SaveAvatarAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.DisableAntiforgery()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Saves a contact avatar in CDN and stores the avatar path in database";

				operation.Response(StatusCodes.Status204NoContent).Description = "The avatar has been stored successfully";
				operation.Response(StatusCodes.Status404NotFound).Description = "Contact not found";

				return operation;
			});

		avatarsApiGroup.MapDelete(string.Empty, DeleteAvatarAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Removes a contact avatar";

				operation.Response(StatusCodes.Status204NoContent).Description = "The avatar has been removed successfully";
				operation.Response(StatusCodes.Status404NotFound).Description = "Contact not found";

				return operation;
			});
	}

	private static async Task<IResult> TeamSummaryAsync(HttpContext httpContext, IContactService service, [AsParameters] TeamSummaryParameters parameters)
		=> (await service.TeamSummaryAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Get(HttpContext httpContext, IContactService service, Guid id)
		=> (await service.GetAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> List(HttpContext httpContext, IContactService service, [AsParameters] ContactSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> FilterClients(HttpContext httpContext, IContactService service, string pattern)
		=> (await service.FilterClients(pattern)).ToResponse(httpContext);

	private static async Task<IResult> FilterCollaborators(HttpContext httpContext, IContactService service, string pattern)
		=> (await service.FilterCollaborators(pattern)).ToResponse(httpContext);

	private static async Task<IResult> CollaboratorsWithMonitor(HttpContext httpContext, IContactService service, [AsParameters] CollaboratorSearchParameters parameters)
		=> (await service.CollaboratorsWithMonitor(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Save(HttpContext httpContext, IContactService service, ContactRequest model)
		=> (await service.SaveAsync(model)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, IContactService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> GetAvatarAsync(Guid id, IAvatarContactService avatarContactService, HttpContext httpContext)
	{
		var result = await avatarContactService.GetAsync(id);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> SaveAvatarAsync(Guid id, IFormFile file, IAvatarContactService avatarContactService, HttpContext httpContext)
	{
		using var stream = file.OpenReadStream();
		var result = await avatarContactService.SaveAsync(id, stream, file.FileName);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> DeleteAvatarAsync(Guid id, IAvatarContactService avatarContactService, HttpContext httpContext)
	{
		var result = await avatarContactService.DeleteAsync(id);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> UnbilledSummaryAsync(HttpContext httpContext, IContactService service)
		=> (await service.UnbilledSummaryAsync()).ToResponse(httpContext);
}