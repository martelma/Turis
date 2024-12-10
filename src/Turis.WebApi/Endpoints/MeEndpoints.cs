using MinimalHelpers.OpenApi;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;

namespace Turis.WebApi.Endpoints;

public class MeEndpoints : IEndpointRouteHandlerBuilder
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var meApiGroup = endpoints.MapGroup("/api/me");

        meApiGroup.MapGet(string.Empty, GetMeAsync)
            .Produces<UserModel>(StatusCodes.Status200OK)
            .Produces<ServiceError>(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Retrieves information about the current user";

                operation.Response(StatusCodes.Status200OK).Description = "The user";
                operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

                return operation;
            });
    }

    private static async Task<IResult> GetMeAsync(IIdentityService identityService, HttpContext httpContext)
    {
        var result = await identityService.GetCurrentUserAsync();
        var response = httpContext.CreateResponse(result);
        return response;
    }
}
