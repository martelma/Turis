using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;

namespace Turis.WebApi.Endpoints;

public class JournalEntryEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/journal-entry");

		//templateApiGroup.MapGet("summary", Summary);
		templateApiGroup.MapGet("year-summary/{year}", YearSummary);
		templateApiGroup.MapGet("period-summary/{period}", PeriodSummary);
		templateApiGroup.MapGet("{id:guid}", Get);
		templateApiGroup.MapGet(string.Empty, List);
		templateApiGroup.MapPost(string.Empty, Save);
		templateApiGroup.MapPut(string.Empty, Save);
		templateApiGroup.MapDelete("{id:guid}", Delete);
	}

	//private static async Task<IResult> Summary(HttpContext httpContext, IJournalEntryService service)
	//	=> (await service.Summary()).ToResponse(httpContext);

	private static async Task<IResult> YearSummary(HttpContext httpContext, IJournalEntryService service, int year)
		=> (await service.YearSummary(year)).ToResponse(httpContext);

	private static async Task<IResult> PeriodSummary(HttpContext httpContext, IJournalEntryService service, string period)
		=> (await service.PeriodSummary(period)).ToResponse(httpContext);

	private static async Task<IResult> Get(HttpContext httpContext, IJournalEntryService service, Guid id)
		=> (await service.GetAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> List(HttpContext httpContext, IJournalEntryService service, [AsParameters] JournalEntrySearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Save(HttpContext httpContext, IJournalEntryService service, JournalEntryRequest model)
		=> (await service.SaveAsync(model)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, IJournalEntryService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);
}