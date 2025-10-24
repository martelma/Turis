using JeMa.Shared.Parameters.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class LanguageService(ApplicationDbContext dbContext, ILogger<LanguageService> logger) : ILanguageService
{
	private readonly DbSet<Language> context = dbContext.Languages;

	public async Task<Result<LanguageModel>> GetAsync(Guid id)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel();
	}

	public async Task<Result<LanguageModel>> GetAsync(string codeIso)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.CodeIso == codeIso);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel();
	}

	public async Task<Result<PaginatedList<LanguageModel>>> ListAsync(LanguageSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = context.AsNoTracking();

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					(x.Code != null && x.Code.Contains(itemPattern))
					|| (x.Name != null && x.Name.Contains(itemPattern))
					|| (x.CodeIso != null && x.CodeIso.Contains(itemPattern)));
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(Language.Name)}Asc":
				{
					query = query.OrderBy(x => x.Name);
					break;
				}
				case $"{nameof(Language.Name)}Desc":
				{
					query = query.OrderByDescending(x => x.Name);
					break;
				}
			}
		}
		else
			query = query.OrderBy(x => x.Name);

		var list = await query
			.Skip(paginator.PageIndex * paginator.PageSize)
			.Take(paginator.PageSize)
			.Select(x => x.ToModel())
			.ToListAsync();

		var result = new PaginatedList<LanguageModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

		return await Task.FromResult(result);
	}

	public async Task<Result> SaveAsync(LanguageRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new Language
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.Code = model.Code;
		record.Name = model.Name;
		record.CodeIso = model.CodeIso;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}