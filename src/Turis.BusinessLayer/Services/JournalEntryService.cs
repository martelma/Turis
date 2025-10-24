using System.Globalization;
using FluentDateTimeOffset;
using JeMa.Shared.Extensions;
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

public class JournalEntryService(ApplicationDbContext dbContext
	, ILogger<JournalEntryService> logger
	, IUserService userService
	, IBookmarkService bookmarkService
	, IAttachmentService attachmentService
	, IEntityTagService entityTagService
	) : IJournalEntryService
{
	private const string EntryName = nameof(JournalEntry);

	private readonly DbSet<JournalEntry> context = dbContext.JournalEntries;

	private async Task<List<Bookmark>> GetMyBookmarks()
		=> await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

	private IQueryable<JournalEntry> Query()
	{
		return context.Include(x => x.User);
	}

	public async Task<Result<SummaryData>> YearSummary(int year)
	{
		var yearData = await dbContext
			.GetData<JournalEntry>()
			.Where(x => x.Date.Year == year)
			.ToListAsync();

		//var yearDataSymmary = yearData
		//	.GroupBy(x => x.Date.Month)
		//	.Select(group => new DataItem
		//	{
		//		ViewOrder = group.Key,
		//		Label = group.Key.ToMonthLabel(),
		//		Income = group.Where(e => e.Amount > 0).Sum(e => e.Amount), // Totale delle entrate
		//		Expense = group.Where(e => e.Amount < 0).Sum(e => e.Amount), // Totale delle uscite
		//		Balance = group.MaxBy(e => e.Date)?.Balance ?? 0 // Saldo di fine periodo
		//	})
		//	.OrderBy(x => x.ViewOrder)
		//	.ToList();


		var yearDataSymmary = await dbContext.Database
			.SqlQuery<DataItem>($@"
		        WITH AllMonths AS (
		            SELECT 1 AS ViewOrder UNION ALL
		            SELECT 2 UNION ALL
		            SELECT 3 UNION ALL
		            SELECT 4 UNION ALL
		            SELECT 5 UNION ALL
		            SELECT 6 UNION ALL
		            SELECT 7 UNION ALL
		            SELECT 8 UNION ALL
		            SELECT 9 UNION ALL
		            SELECT 10 UNION ALL
		            SELECT 11 UNION ALL
		            SELECT 12
		        ),
		        MonthlyData AS (
		            SELECT 
		                MONTH(yd.[Date]) AS ViewOrder,
		                SUM(CASE WHEN yd.Amount > 0 THEN yd.Amount ELSE 0 END) AS Income,
		                SUM(CASE WHEN yd.Amount < 0 THEN yd.Amount ELSE 0 END) AS Expense,
		                (SELECT TOP 1 yd2.Balance 
		                 FROM JournalEntries yd2 
		                 WHERE MONTH(yd2.[Date]) = MONTH(yd.[Date]) 
		                   AND YEAR(yd2.[Date]) = {year}
		                 ORDER BY yd2.[Date] DESC) AS Balance
		            FROM JournalEntries yd
		            WHERE YEAR(yd.[Date]) = {year}
		            GROUP BY MONTH(yd.[Date])
		        )
		        SELECT 
		            am.ViewOrder,
		            DATENAME(MONTH, DATEFROMPARTS({year}, am.ViewOrder, 1)) AS Label,
		            COALESCE(md.Income, 0) AS Income,
		            COALESCE(md.Expense, 0) AS Expense,
		            COALESCE(md.Balance, 0) AS Balance
		        FROM AllMonths am
		        LEFT JOIN MonthlyData md ON am.ViewOrder = md.ViewOrder
		        ORDER BY am.ViewOrder
		    ")
			.ToListAsync();

		var model = new SummaryData
		{
			Data = yearDataSymmary
		};

		return await Task.FromResult(model);
	}

	public async Task<Result<SummaryData>> PeriodSummary(string period)
	{
		var startYear = DateTime.Now.StartYear();
		var startMonth = DateTime.Now.StartMonth();

		var startWeek = DateTime.Now.StartWeek();

		var yearData = await dbContext
			.GetData<JournalEntry>()
			.Where(x => x.Date.Date <= DateTime.UtcNow)
			.Where(x => x.Date.Date >= startYear)
			.ToListAsync();
		var monthData = yearData.Where(x => x.Date.Date >= startMonth).ToList();
		var weekData = yearData.Where(x => x.Date.Date >= startWeek).ToList();

		var model = new SummaryData();

		if (period == "monthData")
		{
			var monthDataSummary = monthData
				.GroupJoin(
					yearData,
					day => day.Date.FirstDayOfMonth(), // Chiave di join (la data completa generata)
					entry => entry.Date.FirstDayOfMonth(), // Chiave di join dei dati originali
					(day, entries) => new DataItem
					{
						ViewOrder = day.Date.Month,
						Label = day.Date.ToString("MM"),
						Income = entries.Where(e => e.Amount > 0).Sum(e => e.Amount), // Entrate
						Expense = entries.Where(e => e.Amount < 0).Sum(e => e.Amount), // Uscite
						Balance = entries.Any()
							? entries.MaxBy(e => e.Date.FirstDayOfMonth())?.Balance ?? 0
							: 0 // Saldo
					}
				)
				.OrderBy(x => x.ViewOrder)
				.ToList();

			model.Data = monthDataSummary;
		}
		else if (period == "weekData")
		{
			var weekDataSummary = weekData
				.GroupBy(x => x.Date.DayOfWeek)
				.Select(group => new DataItem
				{
					ViewOrder = (int)group.Key,
					Label = group.Key.ToDayLabel(),
					Income = group.Where(e => e.Amount > 0).Sum(e => e.Amount), // Totale delle entrate
					Expense = group.Where(e => e.Amount < 0).Sum(e => e.Amount), // Totale delle uscite
					Balance = group.MaxBy(e => e.Date)?.Balance ?? 0 // Saldo di fine periodo
				})
				.OrderBy(x => x.ViewOrder)
				.ToList();

			model.Data = weekDataSummary;
		}


		return await Task.FromResult(model);
	}

	public async Task<Result<JournalEntryModel>> GetAsync(Guid id)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), EntryName);
		var attachments = await attachmentService.ListAsync(EntryName, id);
		var tags = await entityTagService.ListAsync(EntryName, id);

		var record = await Query()
		.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return await record.ToModel(bookmarks, attachments, tags);
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

		query = query.WhereIf(parameters.Description.HasValue(), x => x.Description.Contains(parameters.Description));
		query = query.WhereIf(parameters.Note.HasValue(), x => x.Note.Contains(parameters.Note));

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					(x.Description != null && x.Description.Contains(itemPattern))
					|| (x.Note != null && x.Note.Contains(itemPattern))
				);
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
			var data = query
			.Skip(paginator.PageIndex * paginator.PageSize)
			.Take(paginator.PageSize)
			.ToList();

			var attachments = await attachmentService.ListAsync(EntryName, data.Select(x => x.Id).ToList());
			var tags = await entityTagService.ListAsync(EntryName, data.Select(x => x.Id).ToList());

			var list = await data.ToModel(bookmarks, attachments, tags);

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

		await entityTagService.UpdateTagsAsync(EntryName, record.Id, model.Tags);

		await dbContext.SaveChangesAsync();

		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}
