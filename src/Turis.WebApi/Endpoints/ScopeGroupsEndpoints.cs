using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class ScopeGroupsEndpoints : IEndpointRouteHandlerBuilder
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var scopeGroupsApiGroup = endpoints.MapGroup("/api/applications/{applicationId:guid}/scopeGroups");

        scopeGroupsApiGroup.MapGet(string.Empty, ListAsync)
            .Produces<PaginatedList<ApplicationScopeGroup>>(StatusCodes.Status200OK)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves the list of scope groups available in a given application";

                operation.Response(StatusCodes.Status200OK).Description = "The list of scope groups";

                return operation;
            });

        scopeGroupsApiGroup.MapGet("{scopeGroupId:guid}", GetAsync)
            .Produces<ApplicationScopeGroup>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves the specified scope group";

                operation.Response(StatusCodes.Status200OK).Description = "The scope group";
                operation.Response(StatusCodes.Status404NotFound).Description = "Scope group not found";

                return operation;
            });

        scopeGroupsApiGroup.MapPost(string.Empty, SaveAsync)
            .WithValidation<ApplicationScopeGroup>()
            .Produces<ApplicationScopeGroup>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .WithOpenApi(operation =>
            {
                operation.Summary = "Creates or saves a scope group";

                operation.Response(StatusCodes.Status200OK).Description = "The scope group created/modified";
                operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

                return operation;
            });

        scopeGroupsApiGroup.MapDelete("{scopeGroupId:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .WithOpenApi(operation =>
            {
                operation.Summary = "Deletes the specified scope group";

                operation.Response(StatusCodes.Status204NoContent).Description = "The scope group has been successfully deleted";
                operation.Response(StatusCodes.Status400BadRequest).Description = "The scope group could not be deleted because it is currently in use";
                operation.Response(StatusCodes.Status404NotFound).Description = "Scope group not found";

                return operation;
            });
    }

    private static async Task<IResult> ListAsync(Guid applicationId, IScopeGroupService scopeGroupService, HttpContext httpContext, bool includeScopes = false, int pageIndex = 0, int itemsPerPage = 50, string orderBy = "Name")
    {
        var result = await scopeGroupService.ListAsync(applicationId, includeScopes, pageIndex, itemsPerPage, orderBy);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetAsync(Guid applicationId, Guid scopeGroupId, IScopeGroupService scopeGroupService, HttpContext httpContext, bool includeScopes = false)
    {
        var result = await scopeGroupService.GetAsync(applicationId, scopeGroupId, includeScopes);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> SaveAsync(Guid applicationId, ApplicationScopeGroupModel request, IScopeGroupService scopeGroupService, HttpContext httpContext)
    {
        var result = await scopeGroupService.SaveAsync(applicationId, request);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> DeleteAsync(Guid applicationid, Guid scopeGroupId, IScopeGroupService scopeGroupService, HttpContext httpContext)
    {
        var result = await scopeGroupService.DeleteAsync(applicationid, scopeGroupId);
        var response = httpContext.CreateResponse(result);

        return response;
    }
}