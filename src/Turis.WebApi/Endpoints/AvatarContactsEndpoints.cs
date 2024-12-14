using Microsoft.AspNetCore.Mvc;
using MinimalHelpers.OpenApi;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.WebApi.Endpoints;

public class AvatarContactsEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var avatarsApiGroup = endpoints.MapGroup("/api/contacts/{id:guid}/avatar");

		avatarsApiGroup.MapGet(string.Empty, GetAsync)
			.AllowAnonymous()
			.Produces<FileContentResult>(StatusCodes.Status200OK)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Get the user's avatar";

				operation.Response(StatusCodes.Status200OK).Description = "The user's avatar";
				operation.Response(StatusCodes.Status404NotFound).Description = "Avatar not found";

				return operation;
			});

		avatarsApiGroup.MapPost(string.Empty, SaveAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.DisableAntiforgery()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Saves a user avatar in CDN and stores the avatar path in database";

				operation.Response(StatusCodes.Status204NoContent).Description = "The avatar has been stored successfully";
				operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

				return operation;
			});

		avatarsApiGroup.MapDelete(string.Empty, DeleteAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Removes a user avatar";

				operation.Response(StatusCodes.Status204NoContent).Description = "The avatar has been removed successfully";
				operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

				return operation;
			});
	}

	private static async Task<IResult> GetAsync(Guid id, IAvatarContactService avatarContactService, HttpContext httpContext)
	{
		var result = await avatarContactService.GetAsync(id);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> SaveAsync(Guid id, IFormFile file, IAvatarContactService avatarContactService, HttpContext httpContext)
	{
		using var stream = file.OpenReadStream();
		var result = await avatarContactService.SaveAsync(id, stream, file.FileName);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> DeleteAsync(Guid id, IAvatarContactService avatarContactService, HttpContext httpContext)
	{
		var result = await avatarContactService.DeleteAsync(id);
		var response = httpContext.CreateResponse(result);

		return response;
	}
}