using JeMa.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using OperationResults;
using System.Globalization;
using JeMa.Shared.Parameters.Base;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class PaymentService(ApplicationDbContext dbContext
	, ILogger<PaymentService> logger
	, IUserService userService
	, IBookmarkService bookmarkService
	, IEntityTagService entityTagService
	) : IPaymentService
{
	private const string EntryName = nameof(Payment);

	private readonly DbSet<Payment> context = dbContext.Payments;

	private async Task<List<Bookmark>> GetMyBookmarks()
		=> await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

	private IIncludableQueryable<Payment, Contact> Query()
	{
		return context
			.Include(x => x.Items)
			.ThenInclude(x => x.Service)
			.Include(x => x.Collaborator);
	}

	public async Task<Result<PaymentModel>> GetAsync(Guid id)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

		var record = await Query()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return await record.ToModel(bookmarks);
	}

	public async Task<Result<PaginatedList<PaymentModel>>> ListAsync(PaymentSearchParameters parameters)
	{
		var bookmarks = await GetMyBookmarks();

		var paginator = new Paginator(parameters);

		var query = Query().AsNoTracking();

		if (parameters.OnlyBookmarks)
		{
			var bookmarkIds = bookmarks.Select(x => x.EntityId).ToList();
			query = query.WhereIf(parameters.OnlyBookmarks, x => bookmarkIds.Contains(x.Id));
		}

		//if (parameters.NumberFrom > 0)
		//{
		//	query = query.Where(x => x.Number >= parameters.NumberFrom);
		//}
		//if (parameters.NumberTo > 0)
		//{
		//	query = query.Where(x => x.Number <= parameters.NumberTo);
		//}

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
				var number = itemPattern.IsNumeric() ? Convert.ToInt32(itemPattern) : 0;

				//query = query.Where(x =>
				//	(x.Sectional != null && x.Sectional.Contains(itemPattern))
				//	|| (number > 0 && x.Number == number)
				//	|| (number > 0 && x.Date.Year == number)
				//	|| (x.Client != null && x.Client.CompanyName.Contains(itemPattern))
				//);
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			//switch (parameters.OrderBy)
			//{
			//	case $"{nameof(Payment.Name)}Asc":
			//		{
			//			query = query.OrderBy(x => x.Name);
			//			break;
			//		}
			//	case $"{nameof(Payment.Name)}Desc":
			//		{
			//			query = query.OrderByDescending(x => x.Name);
			//			break;
			//		}
			//}
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

			var result = new PaginatedList<PaymentModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

			return await Task.FromResult(result);
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex);
			throw;
		}
	}

	public async Task<Result> SaveAsync(PaymentRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new Payment
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.Date = model.Date;
		record.CollaboratorId = model.CollaboratorId;

		record.VatRate = model.VatRate;
		record.Vat = model.Vat;

		record.WithholdingTaxRate = model.WithholdingTaxRate;
		record.WithholdingTax = model.WithholdingTax;

		record.Amount = model.Amount;
		record.Total = model.Total;

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