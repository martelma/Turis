using MinimalHelpers.OpenApi;
using OperationResults;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class ServiceEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/service");

		templateApiGroup.MapGet(string.Empty, ListAsync)
			.Produces<PaginatedList<ServiceModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the list of services available in a given application";

				operation.Response(StatusCodes.Status200OK).Description = "The list of services";

				return operation;
			});

		templateApiGroup.MapGet("{serviceId:guid}", GetAsync)
			.Produces<ServiceModel>(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Retrieves the specified service";

				operation.Response(StatusCodes.Status200OK).Description = "The service";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});

		templateApiGroup.MapPost(string.Empty, SaveAsync)
			.WithValidation<ServiceRequest>()
			.Produces<ServiceModel>(StatusCodes.Status200OK)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Creates or saves a service";

				operation.Response(StatusCodes.Status200OK).Description = "The service created/modified";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

				return operation;
			});

		templateApiGroup.MapPut(string.Empty, SaveAsync)
			//.WithValidation<ServiceRequest>()
			.Produces<ServiceModel>(StatusCodes.Status200OK)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Saves a service";

				operation.Response(StatusCodes.Status200OK).Description = "The service created/modified";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

				return operation;
			});

		templateApiGroup.MapDelete("{serviceId:guid}", DeleteAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Deletes the specified service";

				operation.Response(StatusCodes.Status204NoContent).Description = "The service has been successfully deleted";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The service could not be deleted because it is currently in use";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});
	}

	private static async Task<IResult> ListAsync(HttpContext httpContext, IServiceService service, [AsParameters] ServiceSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> GetAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.GetAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> SaveAsync(HttpContext httpContext, IServiceService service, ServiceRequest request)
		=> (await service.SaveAsync(request)).ToResponse(httpContext);
	
	private static async Task<IResult> DeleteAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.DeleteAsync(serviceId)).ToResponse(httpContext);
}