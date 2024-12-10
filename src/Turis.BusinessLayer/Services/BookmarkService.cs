using JeMa.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class BookmarkService(ApplicationDbContext dbContext,
	IUserService userService) : BaseService, IBookmarkService
{
	private readonly DbSet<Bookmark> context = dbContext.Bookmarks;

	public async Task<Result> SaveAsync(BookmarkRequest model)
	{
		var userId = userService.GetUserId();

		var record = model.Id != Guid.Empty ? await context
			.FirstOrDefaultAsync(x => x.Id == model.Id) : null;

		if (record == null)
		{
			record = new Bookmark
			{
				Id = Guid.NewGuid(),
				UserId = userId,
				Date = DateTime.UtcNow,
			};
			await context.AddAsync(record);
		}

		record.EntityName = model.EntityName;
        record.EntityId = model.EntityId.ToGuid();

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}

    public Task<List<Bookmark>> ListAsync(Guid userId, string entityName)
    {
        var record = context.AsNoTracking().Where(x => x.UserId == userId && x.EntityName == entityName).ToListAsync();

		return record;
    }
}