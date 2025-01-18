using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;

namespace Turis.WebApi.Endpoints;

public class AttachmentEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/attachment");

		templateApiGroup.MapGet("list", List)
			.Produces<IEnumerable<AttachmentModel>>(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.WithOpenApi();

		templateApiGroup.MapPost("upload", Upload)
			.Produces(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.DisableAntiforgery()
			.Accepts<IFormFile>("multipart/form-data")
			.WithOpenApi();

		templateApiGroup.MapDelete("{id:guid}", Delete)
			.Produces(StatusCodes.Status404NotFound)
			.Produces(StatusCodes.Status204NoContent);

		templateApiGroup.MapDelete("delete-all/{entityName}/{entityKey:guid}/{folder}", DeleteAll)
			.Produces(StatusCodes.Status404NotFound)
			.Produces(StatusCodes.Status204NoContent);
	}

	private static async Task<IResult> List(HttpContext httpContext, IAttachmentService service, [AsParameters] AttachmentSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Upload(HttpContext httpContext, IAttachmentService service, IFormFileCollection files
		, [FromForm(Name = "entityName")] string entityName
		, [FromForm(Name = "entityKey")] string entityKey
		, [FromForm(Name = "folder")] string folder)
		=> (await service.Upload(files, entityName, entityKey, folder)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, IAttachmentService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> DeleteAll(HttpContext httpContext, IAttachmentService service, string entityName, Guid entityKey, string folder)
		=> (await service.DeleteAllAsync(entityName, entityKey, folder)).ToResponse(httpContext);
}