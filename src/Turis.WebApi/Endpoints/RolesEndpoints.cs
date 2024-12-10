using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.Authentication.Extensions;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class RolesEndpoints : IEndpointRouteHandlerBuilder
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var rolesApiGroup = endpoints.MapGroup("/api/applications/{applicationId:guid}/roles");

        rolesApiGroup.MapGet(string.Empty, ListAsync)
            .Produces<PaginatedList<ApplicationRole>>(StatusCodes.Status200OK)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Gets the list of roles available in a given application";

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

        rolesApiGroup.MapPost(string.Empty, SaveAsync)
            .WithValidation<ApplicationRole>()
            .Produces<ApplicationRole>(StatusCodes.Status200OK)
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

    private static async Task<IResult> ListAsync(Guid applicationId, IRoleService roleService, HttpContext httpContext, int pageIndex = 0, int itemsPerPage = 50, string orderBy = "Name")
    {
        var result = await roleService.ListAsync(httpContext.User.GetId(), applicationId, pageIndex, itemsPerPage, orderBy);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetAsync(Guid applicationId, Guid roleId, IRoleService roleService, HttpContext httpContext)
    {
        var result = await roleService.GetAsync(applicationId, roleId);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> SaveAsync(Guid applicationId, ApplicationRoleModel request, IRoleService roleService, HttpContext httpContext)
    {
        var result = await roleService.SaveAsync(applicationId, request);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> DeleteAsync(Guid applicationid, Guid roleId, IRoleService roleService, HttpContext httpContext)
    {
        var result = await roleService.DeleteAsync(applicationid, roleId);
        var response = httpContext.CreateResponse(result);

        return response;
    }
}