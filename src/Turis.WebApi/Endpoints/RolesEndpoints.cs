using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.Authentication.Extensions;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class RolesEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var rolesApiGroup = endpoints.MapGroup("/api/roles");

		rolesApiGroup.MapGet(string.Empty, ListAsync)
			.Produces<PaginatedList<ApplicationRole>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the list of roles available in a given application";

				operation.Response(StatusCodes.Status200OK).Description = "The list of roles";

				return operation;
			});

		rolesApiGroup.MapGet("{userId:guid}/UserRoles", UserRolesAsync)
			.Produces<PaginatedList<ApplicationRole>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the list of roles available for a given user";

				operation.Response(StatusCodes.Status200OK).Description = "The list of roles";

				return operation;
			});

		rolesApiGroup.MapGet("{roleId:guid}", GetAsync)
			.Produces<ApplicationRole>(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Retrieves the specified role";

				operation.Response(StatusCodes.Status200OK).Description = "The role";
				operation.Response(StatusCodes.Status404NotFound).Description = "Role not found";

				return operation;
			});

		OpenApiRouteHandlerBuilderExtensions
			.Produces<ApplicationRoleRequest>(rolesApiGroup.MapPost(string.Empty, SaveAsync)
			.WithValidation<ApplicationRoleRequest>(), StatusCodes.Status200OK)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Creates or saves a role";

				operation.Response(StatusCodes.Status200OK).Description = "The role created/modified";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

				return operation;
			});

		rolesApiGroup.MapDelete("{roleId:guid}", DeleteAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Deletes the specified role";

				operation.Response(StatusCodes.Status204NoContent).Description = "The role has been successfully deleted";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The role could not be deleted because it is currently in use";
				operation.Response(StatusCodes.Status404NotFound).Description = "Role not found";

				return operation;
			});
	}

	private static async Task<IResult> ListAsync(HttpContext httpContext, IRoleService roleService, int pageIndex = 0, int itemsPerPage = 50, string orderBy = "Name")
	{
		var result = await roleService.ListAsync(httpContext.User.GetId(), pageIndex, itemsPerPage, orderBy);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> UserRolesAsync(IRoleService roleService, Guid userId, HttpContext httpContext, int pageIndex = 0, int itemsPerPage = 50, string orderBy = "Name")
	{
		var result = await roleService.UserRolesAsync(userId, pageIndex, itemsPerPage, orderBy);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> GetAsync(HttpContext httpContext, IRoleService roleService, Guid roleId)
	{
		var result = await roleService.GetAsync(roleId);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> SaveAsync(HttpContext httpContext, IRoleService roleService, ApplicationRoleRequest request)
	{
		var result = await roleService.SaveAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> DeleteAsync(HttpContext httpContext, IRoleService roleService, Guid roleId)
	{
		var result = await roleService.DeleteAsync(roleId);
		var response = httpContext.CreateResponse(result);

		return response;
	}
}