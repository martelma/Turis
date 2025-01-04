using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class UsersEndpoints : IEndpointRouteHandlerBuilder
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var usersApiGroup = endpoints.MapGroup("/api/users");

        usersApiGroup.MapGet(string.Empty, ListAsync)
            .Produces<PaginatedList<UserModel>>(StatusCodes.Status200OK)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves all the available users";

                operation.Response(StatusCodes.Status200OK).Description = "The users list";

                return operation;
            });

        usersApiGroup.MapGet("{id:guid}", GetAsync)
            .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = $"{JwtBearerDefaults.AuthenticationScheme},WorkspaceApiKey" })
            .Produces<UserModel>(StatusCodes.Status200OK)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves a specific user";

                operation.Response(StatusCodes.Status200OK).Description = "The user";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });

        usersApiGroup.MapGet("external/{id:guid}/me", GetExternalMeAsync)
            .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = $"{JwtBearerDefaults.AuthenticationScheme},WorkspaceApiKey" })
            .Produces<UserModel>(StatusCodes.Status200OK)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves an user with all informations for external services";

                operation.Response(StatusCodes.Status200OK).Description = "The user with all informations";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });

        /*usersApiGroup.MapGet("external/me", GetExternalMeAsync)
            .RequireAuthorization()
            .Produces<User>(StatusCodes.Status200OK)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves an user with all informations for external services";

                operation.Response(StatusCodes.Status200OK).Description = "The user with all informations";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });*/

        usersApiGroup.MapGet("external/{id:guid}", GetExternalAsync)
            .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = $"{JwtBearerDefaults.AuthenticationScheme},WorkspaceApiKey" })
            .Produces<UserModel>(StatusCodes.Status200OK)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves an user for external services";

                operation.Response(StatusCodes.Status200OK).Description = "The user";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });

        usersApiGroup.MapGet("external", GetExternalListAsync)
            .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = $"{JwtBearerDefaults.AuthenticationScheme},WorkspaceApiKey" })
            .Produces<PaginatedList<UserModel>>(StatusCodes.Status200OK)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves a list of users for external services";

                operation.Response(StatusCodes.Status200OK).Description = "The user list";

                return operation;
            });

        usersApiGroup.MapPut(string.Empty, UpdateAsync)
            .WithValidation<UpdateUserRequest>()
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            .WithOpenApi(operation =>
            {
                operation.Summary = "Updates a user";

                operation.Response(StatusCodes.Status204NoContent).Description = "The user has been successfully updated";
                operation.Response(StatusCodes.Status400BadRequest).Description = "The user could not be updated due to invalid provided information";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });

        usersApiGroup.MapDelete("{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Deletes a user";

                operation.Response(StatusCodes.Status204NoContent).Description = "The user has been successfully deleted";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });

        usersApiGroup.MapGet("external/application/{applicationId:guid}", GetExternalApplicationListAsync)
            .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = $"{JwtBearerDefaults.AuthenticationScheme},WorkspaceApiKey" })
            .Produces<UserModel>(StatusCodes.Status200OK)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves all users in a given application for external services";

                operation.Response(StatusCodes.Status200OK).Description = "The users";

                return operation;
            });

        usersApiGroup.MapPost("copy-settings", CopySettingsAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Copies the settings of selected user to another user";

                operation.Response(StatusCodes.Status204NoContent).Description = "The user has been successfully updated";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });
        
        usersApiGroup.MapPut("{id:guid}/Language", UpdateUserLanguageAsync)
           .Produces(StatusCodes.Status204NoContent)
           .Produces<ServiceError>(StatusCodes.Status404NotFound)
           .ProducesValidationProblem()
           .WithOpenApi(operation =>
           {
               operation.Summary = "Updates a user language";

               operation.Response(StatusCodes.Status204NoContent).Description = "The user language has been successfully updated";
               operation.Response(StatusCodes.Status400BadRequest).Description = "The user language could not be updated due to invalid provided information";
               operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

               return operation;
           });
    }

    private static async Task<IResult> ListAsync(IIdentityService identityService, HttpContext httpContext, [AsParameters] UserSearchParameters parameters)
    {
        var result = await identityService.GetUsersAsync(parameters);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetAsync(Guid id, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.GetUserAsync(id);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetExternalMeAsync(Guid id, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.GetUserMeForExternalAsync(id);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetExternalAsync(Guid id, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.GetUserForExternalAsync(id);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetExternalListAsync([FromQuery(Name = "id")] Guid[] ids, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.GetUsersForExternalAsync(ids);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> GetExternalApplicationListAsync(Guid applicationId, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.GetUsersForExternalApplicationAsync(applicationId);
        var response = httpContext.CreateResponse(result);

        return response;
    }
    

    private static async Task<IResult> UpdateAsync(UpdateUserRequest request, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.UpdateAsync(request);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> DeleteAsync(Guid id, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.DeleteAsync(id);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> CopySettingsAsync(CopyUserSettingsRequest request, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.CopyUserSettingsAsync(request);
        var response = httpContext.CreateResponse(result);

        return response;
    }

    private static async Task<IResult> UpdateUserLanguageAsync(Guid id, UpdateUserLanguageRequest request, IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.UpdateLanguageAsync(id, request);
        var response = httpContext.CreateResponse(result);

        return response;
    }
}
