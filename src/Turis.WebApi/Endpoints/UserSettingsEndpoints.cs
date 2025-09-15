using MinimalHelpers.OpenApi;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;

namespace Turis.WebApi.Endpoints;

public class UserSettingsEndpoints : IEndpointRouteHandlerBuilder
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var usersApiGroup = endpoints.MapGroup("/api/user-settings");

        usersApiGroup.MapPost(string.Empty, SetValueAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Set Application Key for current user";

                operation.Response(StatusCodes.Status204NoContent).Description = "The Application Key has been successfully saved";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });

        usersApiGroup.MapGet(string.Empty, GetValueAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Get Application Key for current user";

                operation.Response(StatusCodes.Status204NoContent).Description = "The Application Key has been successfully get";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });
    }

    private static async Task<IResult> SetValueAsync(HttpContext httpContext, IUserSettingService service,
	    UserSettingRequest request)
	    => (await service.SetValueAsync(request.Key, request.Value)).ToResponse(httpContext);

    private static async Task<IResult> GetValueAsync(HttpContext httpContext, IUserSettingService service,
	    string key)
	    => (await service.GetValueAsync(key)).ToResponse(httpContext);
}