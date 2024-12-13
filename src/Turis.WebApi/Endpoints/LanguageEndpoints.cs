﻿using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;

namespace Turis.WebApi.Endpoints;

public class LanguageEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/language");

		templateApiGroup.MapGet("{id:guid}", Get).AllowAnonymous();
		templateApiGroup.MapGet(string.Empty, List).AllowAnonymous();
		templateApiGroup.MapPost(string.Empty, Save).AllowAnonymous();
		templateApiGroup.MapPut(string.Empty, Save).AllowAnonymous();
		templateApiGroup.MapDelete("{id:guid}", Delete).AllowAnonymous();
	}

	private static async Task<IResult> Get(HttpContext httpContext, ILanguageService service, Guid id)
		=> (await service.GetAsync(id)).ToResponse(httpContext);

	private static async Task<IResult> List(HttpContext httpContext, ILanguageService service, [AsParameters] LanguageSearchParameters parameters)
		=> (await service.ListAsync(parameters)).ToResponse(httpContext);

	private static async Task<IResult> Save(HttpContext httpContext, ILanguageService service, LanguageRequest model)
		=> (await service.SaveAsync(model)).ToResponse(httpContext);

	private static async Task<IResult> Delete(HttpContext httpContext, ILanguageService service, Guid id)
		=> (await service.DeleteAsync(id)).ToResponse(httpContext);
}