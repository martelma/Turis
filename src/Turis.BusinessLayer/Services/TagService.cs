using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class TagService(ApplicationDbContext dbContext, ILogger<TagService> logger) : ITagService
{
	private readonly DbSet<Tag> context = dbContext.Tags;

	public async Task<Result<TagModel>> GetAsync(Guid id)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel();
	}

	public async Task<Result<PaginatedList<TagModel>>> ListAsync(TagSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = context.AsNoTracking();

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					x.Name != null && x.Name.Contains(itemPattern)
					|| x.Description != null && x.Description.Contains(itemPattern));
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(Tag.Name)}Asc":
				{
					query = query.OrderBy(x => x.Name);
					break;
				}
				case $"{nameof(Tag.Name)}Desc":
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

		var result = new PaginatedList<TagModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

		return await Task.FromResult(result);
	}

	public async Task<Result> SaveAsync(TagRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new Tag
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.Name = model.Name;
		record.Description = model.Description;
		record.Color = model.Color;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}