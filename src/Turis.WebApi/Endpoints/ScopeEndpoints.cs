using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class ScopesEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var scopesApiGroup = endpoints.MapGroup("api/scopes");

		scopesApiGroup.MapGet(string.Empty, ListAsync)
			.Produces<PaginatedList<ApplicationScope>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Retrieves the list of scopes available in a given application";

				operation.Response(StatusCodes.Status200OK).Description = "The scope list";

				return operation;
			});

		scopesApiGroup.MapGet("{scopeId:guid}", GetAsync)
			.Produces<ApplicationScope>(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Retrieves the specified scope";

				operation.Response(StatusCodes.Status200OK).Description = "The scope";
				operation.Response(StatusCodes.Status404NotFound).Description = "Scope not found";

				return operation;
			});

		OpenApiRouteHandlerBuilderExtensions
			.Produces<ApplicationScopeRequest>(scopesApiGroup.MapPost(string.Empty, SaveAsync)
			.WithValidation<ApplicationScopeRequest>(), StatusCodes.Status200OK)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Creates or saves a scope";

				operation.Response(StatusCodes.Status200OK).Description = "The scope created/modified";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

				return operation;
			});

		scopesApiGroup.MapDelete("{scopeId:guid}", DeleteAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Deletes the specified scope";

				operation.Response(StatusCodes.Status204NoContent).Description = "The scope has been successfully deleted";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The scope could not be deleted because it is currently in use";
				operation.Response(StatusCodes.Status404NotFound).Description = "Scope not found";

				return operation;
			});
	}

	private static async Task<IResult> ListAsync(HttpContext httpContext, IScopeService scopeService, Guid? roleId = null, int pageIndex = 0, int itemsPerPage = 50, string orderBy = "Name")
	{
		var result = await scopeService.ListAsync(roleId, pageIndex, itemsPerPage, orderBy);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> GetAsync(HttpContext httpContext, IScopeService scopeService, Guid scopeId)
	{
		var result = await scopeService.GetAsync(scopeId);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> SaveAsync(HttpContext httpContext, IScopeService scopeService, ApplicationScopeRequest request)
	{
		var result = await scopeService.SaveAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> DeleteAsync(HttpContext httpContext, IScopeService scopeService, Guid scopeId)
	{
		var result = await scopeService.DeleteAsync(scopeId);
		var response = httpContext.CreateResponse(result);

		return response;
	}
}