using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;

namespace Turis.WebApi.Endpoints;

public class TargetEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/target");

		templateApiGroup.MapGet("{id:guid}", Get);
		templateApiGroup.MapGet(string.Empty, List);
		templateApiGroup.MapGet("commission-stats", CommissionStatsAsync);
		templateApiGroup.MapPost(string.Empty, Save);
		templateApiGroup.MapPut(string.Empty, Save);
		templateApiGroup.MapDelete("{id:guid}", Delete);
	}

	private static async Task<IResult> Get(HttpContext httpContext, ITargetService service, Guid id)
		=> (await service.GetAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> List(HttpContext httpContext, ITargetService service, [AsParameters] TargetSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> CommissionStatsAsync(HttpContext httpContext, ITargetService service, [AsParameters] TargetSearchParameters parameters)
		=> (await service.CommissionStatsAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Save(HttpContext httpContext, ITargetService service, TargetRequest model)
		=> (await service.SaveAsync(model)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, ITargetService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);
}