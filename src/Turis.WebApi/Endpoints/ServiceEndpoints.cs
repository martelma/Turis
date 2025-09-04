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

		templateApiGroup.MapGet("summary", SummaryAsync)
			.Produces<PaginatedList<ServiceModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the services summary";

				operation.Response(StatusCodes.Status200OK).Description = "The services summary";

				return operation;
			});

		templateApiGroup.MapGet("contact-summary/{contactId:guid}", ContactSummaryAsync)
			.Produces<PaginatedList<ServiceModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the contact summary";

				operation.Response(StatusCodes.Status200OK).Description = "The contact summary";

				return operation;
			});

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

		templateApiGroup.MapGet("account-statement", AccountStatement);

		templateApiGroup.MapGet("check-data-info/{serviceId:guid}", CheckDataInfoAsync)
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
			//.WithValidation<ServiceRequest>()
			//.Produces<ServiceModel>(StatusCodes.Status200OK)
			//.ProducesValidationProblem()
			//.WithOpenApi(operation =>
			//{
			//	operation.Summary = "Creates or saves a service";

			//	operation.Response(StatusCodes.Status200OK).Description = "The service created/modified";
			//	operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

			//	return operation;
			//})
			;

		templateApiGroup.MapPut(string.Empty, SaveAsync)
			.WithValidation<ServiceRequest>()
			.Produces<ServiceModel>(StatusCodes.Status200OK)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Saves a service";

				operation.Response(StatusCodes.Status200OK).Description = "The service created/modified";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Data validation error";

				return operation;
			})
			;

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

		templateApiGroup.MapPost("notify-proposal/{serviceId:guid}", NotifyProposalAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Notify a Proposal for a specific service";

				operation.Response(StatusCodes.Status204NoContent).Description = "The Proposal has been successfully sent";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The Proposal could not be sent";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});

		templateApiGroup.MapPost("accept-service/{serviceId:guid}", AcceptServiceAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Service accepted";

				operation.Response(StatusCodes.Status400BadRequest).Description = "The Service could not be accept";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});

		templateApiGroup.MapPost("reject-service/{serviceId:guid}", RejectServiceAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Service rejected";

				operation.Response(StatusCodes.Status400BadRequest).Description = "The Service could not be reject";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});
	}

	private static async Task<IResult> SummaryAsync(HttpContext httpContext, IServiceService service)
		=> (await service.SummaryAsync()).ToResponse(httpContext);

	private static async Task<IResult> ContactSummaryAsync(HttpContext httpContext, IServiceService service, Guid contactId)
		=> (await service.ContactSummaryAsync(contactId)).ToResponse(httpContext);

	private static async Task<IResult> ListAsync(HttpContext httpContext, IServiceService service, [AsParameters] ServiceSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> GetAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.GetAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> AccountStatement(HttpContext httpContext, IServiceService service, [AsParameters] AccountStatementParameters parameters)
		=> (await service.AccountStatement(parameters)).ToResponse(httpContext);

	private static async Task<IResult> CheckDataInfoAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.CheckDataInfoAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> SaveAsync(HttpContext httpContext, IServiceService service, ServiceRequest request)
		=> (await service.SaveAsync(request)).ToResponse(httpContext);

	private static async Task<IResult> DeleteAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.DeleteAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> NotifyProposalAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.NotifyProposalAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> AcceptServiceAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.AcceptServiceAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> RejectServiceAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.RejectServiceAsync(serviceId)).ToResponse(httpContext);
}