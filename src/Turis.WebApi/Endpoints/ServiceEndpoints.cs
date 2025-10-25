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

		templateApiGroup.MapGet("summary/{year}", SummaryAsync)
			.Produces<PaginatedList<ServiceModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the services summary";

				operation.Response(StatusCodes.Status200OK).Description = "The services summary";

				return operation;
			});

		templateApiGroup.MapGet("summary-details-proposals", SummaryDetailsProposalsAsync);
		templateApiGroup.MapGet("summary-details-checked", SummaryDetailsCheckedAsync);
		templateApiGroup.MapGet("summary-details-todo", SummaryDetailsToDoAsync);
		templateApiGroup.MapGet("summary-details-done", SummaryDetailsDoneAsync);

		templateApiGroup.MapGet("to-be-billed/{year}/{clientId:guid}", ToBeBilledAsync)
			.Produces<IEnumerable<ServiceModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the services to be billed";

				operation.Response(StatusCodes.Status200OK).Description = "The services to be billed";

				return operation;
			});

		templateApiGroup.MapGet("to-be-paid/{year}/{collaboratorId:guid}", ToBePaidAsync)
			.Produces<IEnumerable<ServiceModel>>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Gets the services to be paid";

				operation.Response(StatusCodes.Status200OK).Description = "The services to be paid";

				return operation;
			});

		templateApiGroup.MapGet("contact-summary/{contactId:guid}/{year}", ContactSummaryAsync)
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

		templateApiGroup.MapGet("linked-services/{serviceId:guid}", LinkedServicesAsync)
			.Produces<IEnumerable<LinkedServiceModel>>(StatusCodes.Status200OK)
			.Produces(StatusCodes.Status404NotFound)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Retrieves the linked services";

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

		templateApiGroup.MapPost("{targetServiceId:guid}/add-source-service/{sourceServiceId:guid}", AddServiceRelationAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Add Source Service";

				operation.Response(StatusCodes.Status400BadRequest).Description = "The Source Service could not be added";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});

		templateApiGroup.MapPost("{targetServiceId:guid}/remove-source-service/{sourceServiceId}", RemoveServiceRelationAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Remove Source service";

				operation.Response(StatusCodes.Status204NoContent).Description = "The Source Service has been successfully removed";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});

		templateApiGroup.MapPost("{sourceServiceId:guid}/add-target-service/{targetServiceId}", AddServiceRelationAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Add target service";

				operation.Response(StatusCodes.Status204NoContent).Description = "The Target Service has been successfully added";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});

		templateApiGroup.MapPost("{sourceServiceId:guid}/remove-target-service/{targetServiceId}", RemoveServiceRelationAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Remove target service";

				operation.Response(StatusCodes.Status204NoContent).Description = "The Target Service has been successfully removed";
				operation.Response(StatusCodes.Status404NotFound).Description = "service not found";

				return operation;
			});
	}

	private static async Task<IResult> SummaryAsync(HttpContext httpContext, IServiceService service, int year)
		=> (await service.SummaryAsync(year)).ToResponse(httpContext);

	private static async Task<IResult> SummaryDetailsProposalsAsync(HttpContext httpContext, IServiceService service)
		=> (await service.SummaryDetailsProposalsAsync()).ToResponse(httpContext);

	private static async Task<IResult> SummaryDetailsCheckedAsync(HttpContext httpContext, IServiceService service)
		=> (await service.SummaryDetailsCheckedAsync()).ToResponse(httpContext);

	private static async Task<IResult> SummaryDetailsToDoAsync(HttpContext httpContext, IServiceService service)
		=> (await service.SummaryDetailsToDoAsync()).ToResponse(httpContext);

	private static async Task<IResult> SummaryDetailsDoneAsync(HttpContext httpContext, IServiceService service)
		=> (await service.SummaryDetailsDoneAsync()).ToResponse(httpContext);

	private static async Task<IResult> ToBeBilledAsync(HttpContext httpContext, IServiceService service, int year, Guid clientId)
		=> (await service.ToBeBilledAsync(year, clientId)).ToResponse(httpContext);

	private static async Task<IResult> ToBePaidAsync(HttpContext httpContext, IServiceService service, int year, Guid collaboratorId)
		=> (await service.ToBePaidAsync(year, collaboratorId)).ToResponse(httpContext);

	private static async Task<IResult> ContactSummaryAsync(HttpContext httpContext, IServiceService service, Guid contactId, int year)
		=> (await service.ContactSummaryAsync(contactId, year)).ToResponse(httpContext);

	private static async Task<IResult> ListAsync(HttpContext httpContext, IServiceService service, [AsParameters] ServiceSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> GetAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.GetAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> AccountStatement(HttpContext httpContext, IServiceService service, [AsParameters] AccountStatementParameters parameters)
		=> (await service.AccountStatement(parameters)).ToResponse(httpContext);

	private static async Task<IResult> CheckDataInfoAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.CheckDataInfoAsync(serviceId)).ToResponse(httpContext);

	private static async Task<IResult> LinkedServicesAsync(HttpContext httpContext, IServiceService service, Guid serviceId)
		=> (await service.LinkedServicesAsync(serviceId)).ToResponse(httpContext);

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

	private static async Task<IResult> AddServiceRelationAsync(HttpContext httpContext, IServiceService service, Guid sourceServiceId, Guid targetServiceId)
		=> (await service.AddServiceRelationAsync(sourceServiceId, targetServiceId)).ToResponse(httpContext);

	private static async Task<IResult> RemoveServiceRelationAsync(HttpContext httpContext, IServiceService service, Guid sourceServiceId, Guid targetServiceId)
		=> (await service.RemoveServiceRelationAsync(sourceServiceId, targetServiceId)).ToResponse(httpContext);
}