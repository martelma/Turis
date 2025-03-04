using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.BusinessLayer.Settings;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class EntityTagService(ApplicationDbContext dbContext
	, IOptions<CdnSettings> cdnOptions
	, IUserService userService
	, IAuthService authService
	, ILogger<EntityTagService> logger) : BaseService, IEntityTagService
{
	private readonly DbSet<EntityTag> context = dbContext.EntityTags;
	private readonly CdnSettings cdnSettings = cdnOptions.Value;

	IQueryable<EntityTag> Query()
	{
		return context
			.Include(x => x.Tag);
	}

	public async Task<Result<EntityTagModel>> GetAsync(Guid id)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel(authService);
	}

	public async Task<Result<EntityTagModel>> GetAsync(string entityName, Guid entityKey)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.EntityName == entityName && x.EntityKey == entityKey);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel(authService);
	}

	public async Task<List<EntityTag>> ListAsync(string entityName, Guid entityKey)
	{
		var list = Query()
			.Where(x => x.EntityName == entityName)
			.Where(x => x.EntityKey == entityKey)
			?.ToList();

		return await Task.FromResult(list);
	}

	public async Task<List<EntityTag>> ListAsync(string entityName, List<Guid> entityKeys)
	{
		var list = Query()
			.Where(x => x.EntityName == entityName)
			.Where(x => entityKeys.Contains(x.EntityKey))
			?.ToList();

		return await Task.FromResult(list);
	}

	public async Task<Result<PaginatedList<EntityTagModel>>> ListAsync(EntityTagSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = context.AsNoTracking();

		if (parameters.EntityName.HasValue())
		{
			query = query.Where(x => x.EntityName == parameters.EntityName);
		}
		if (parameters.EntityKey.HasValue())
		{
			query = query.Where(x => x.EntityKey.ToString() == parameters.EntityKey);
		}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(EntityTag.TimeStamp)}Asc":
					{
						query = query.OrderBy(x => x.TimeStamp);
						break;
					}
				case $"{nameof(EntityTag.TimeStamp)}Desc":
					{
						query = query.OrderByDescending(x => x.TimeStamp);
						break;
					}
			}
		}
		else
			query = query.OrderBy(x => x.Tag.Name);

		var list = await query
			.Skip(paginator.PageIndex * paginator.PageSize)
			.Take(paginator.PageSize)
			.Select(x => x.ToModel(authService))
			.ToListAsync();

		var result = new PaginatedList<EntityTagModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

		return await Task.FromResult(result);
	}

	public async Task<EntityTag> SaveAsync(EntityTagRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new EntityTag
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.EntityName = model.EntityName;
		record.EntityKey = model.EntityKey;
		record.UserId = userService.GetUserId();
		record.TimeStamp = DateTime.Now;
		record.TagId = model.TagId;

		await dbContext.SaveChangesAsync();
		return record;
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}

	public Task<Result> DeleteAllAsync(string entityName, Guid entityKey)
	{
		throw new NotImplementedException();
	}

	public async Task UpdateTagsAsync(string entityName, Guid entityKey, List<TagRequest> serviceTags)
	{
		var oldTags = await ListAsync(entityName, entityKey);

		var tagsToRemove = oldTags.Where(oldTag => serviceTags.All(newTag => newTag.Id != oldTag.Id)).ToList();
		var tagsToAdd = serviceTags.Where(newTag => oldTags.All(oldTag => oldTag.Id != newTag.Id)).ToList();
		//var tagsToUpdate = serviceTags.Where(newTag =>oldTags.Any(oldTag => oldTag.Id == newTag.Id)).ToList();

		// Rimuovi i tag non più necessari
		context.RemoveRange(tagsToRemove);

		// Aggiungi i nuovi tag
		foreach (var tag in tagsToAdd)
		{
			await context.AddRangeAsync(new EntityTag
			{
				Id = Guid.NewGuid(),
				EntityName = entityName,
				EntityKey = entityKey,
				TagId = tag.Id,
				UserId = userService.GetUserId(),
				TimeStamp = DateTimeOffset.UtcNow
			});
		}
	}
}