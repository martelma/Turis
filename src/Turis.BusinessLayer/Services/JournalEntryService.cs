using System.Globalization;
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

public class JournalEntryService(ApplicationDbContext dbContext
	, IUserService userService
	, IBookmarkService bookmarkService
	, ILogger<JournalEntryService> logger) : IJournalEntryService
{
	private readonly DbSet<JournalEntry> context = dbContext.JournalEntries;

	private async Task<List<Bookmark>> GetMyBookmarks()
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), nameof(JournalEntry));
		return bookmarks;
	}

	private IQueryable<JournalEntry> Query()
	{
		return context.Include(x => x.User);
	}

	public async Task<Result<JournalEntryModel>> GetAsync(Guid id)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), nameof(JournalEntry));

		var record = await Query()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return await record.ToModel(bookmarks);
	}

	public async Task<Result<PaginatedList<JournalEntryModel>>> ListAsync(JournalEntrySearchParameters parameters)
	{
		var bookmarks = await GetMyBookmarks();

		var paginator = new Paginator(parameters);

		var query = Query().AsNoTracking();

		if (parameters.OnlyBookmarks)
		{
			var bookmarkIds = bookmarks.Select(x => x.EntityId).ToList();
			query = query.WhereIf(parameters.OnlyBookmarks, x => bookmarkIds.Contains(x.Id));
		}

		if (parameters.DateFrom.HasValue())
		{
			var dateFrom = DateTime.ParseExact(parameters.DateFrom, "yyyyMMdd", CultureInfo.InvariantCulture);
			query = query.Where(x => x.Date >= dateFrom);
		}
		if (parameters.DateTo.HasValue())
		{
			var dateTo = DateTime.ParseExact(parameters.DateTo, "yyyyMMdd", CultureInfo.InvariantCulture);
			query = query.Where(x => x.Date <= dateTo);
		}

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					(x.Description != null && x.Description.Contains(itemPattern))
					|| (x.Note != null && x.Note.Contains(itemPattern)));
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(JournalEntry.Description)}Asc":
					{
						query = query.OrderBy(x => x.Description);
						break;
					}
				case $"{nameof(JournalEntry.Description)}Desc":
					{
						query = query.OrderByDescending(x => x.Description);
						break;
					}
				case $"{nameof(JournalEntry.TimeStamp)}Asc":
					{
						query = query.OrderBy(x => x.TimeStamp);
						break;
					}
				case $"{nameof(JournalEntry.TimeStamp)}Desc":
					{
						query = query.OrderByDescending(x => x.TimeStamp);
						break;
					}
				case $"{nameof(JournalEntry.Date)}Asc":
					{
						query = query.OrderBy(x => x.Date);
						break;
					}
				case $"{nameof(JournalEntry.Date)}Desc":
					{
						query = query.OrderByDescending(x => x.Date);
						break;
					}
				case $"{nameof(JournalEntry.Amount)}Asc":
					{
						query = query.OrderBy(x => x.Amount);
						break;
					}
				case $"{nameof(JournalEntry.Amount)}Desc":
					{
						query = query.OrderByDescending(x => x.Amount);
						break;
					}
			}
		}
		else
			query = query.OrderByDescending(x => x.Date);

		try
		{
			var page = query
				.Skip(paginator.PageIndex * paginator.PageSize)
				.Take(paginator.PageSize)
				.ToList();

			var list = await page.ToModel(bookmarks);

			var result = new PaginatedList<JournalEntryModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

			return await Task.FromResult(result);
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex);
			throw;
		}
	}

	public async Task<Result> SaveAsync(JournalEntryRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new JournalEntry
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.UserId = userService.GetUserId();
		record.TimeStamp = DateTimeOffset.Now;
		record.Date = model.Date;
		record.Amount = model.Amount;
		record.Description = model.Description;
		record.Note = model.Note;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}