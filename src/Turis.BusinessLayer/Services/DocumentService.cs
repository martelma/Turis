using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using OperationResults;
using System.Globalization;
using JeMa.Shared.AspNetCore.Extensions;
using JeMa.Shared.Extensions;
using JeMa.Shared.Parameters.Base;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Enums;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class DocumentService(ApplicationDbContext dbContext
	, ILogger<DocumentService> logger
	, IUserService userService
	, IBookmarkService bookmarkService
	, IEntityTagService entityTagService
	) : IDocumentService
{
	private const string EntryName = nameof(Document);

	private readonly DbSet<Document> context = dbContext.Documents;

	private async Task<List<Bookmark>> GetMyBookmarks()
		=> await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

	private IIncludableQueryable<Document, Contact> Query()
	{
		return context
			.Include(x => x.Items)
			.ThenInclude(x => x.Service)
			.Include(x => x.DocumentRef)
			.Include(x => x.Client)
			.Include(x => x.Collaborator);
	}

	public async Task<Result<DocumentModel>> GetAsync(Guid id)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

		var record = await Query()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return await record.ToModelAsync(bookmarks);
	}

	public async Task<Result<DocumentModel>> GetAsync(string sectional, int number)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

		var record = await Query()
			.FirstOrDefaultAsync(x => x.Sectional == sectional && x.Number == number);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return await record.ToModelAsync(bookmarks);
	}

	public async Task<Result<PaginatedList<DocumentModel>>> ListAsync(DocumentSearchParameters parameters)
	{
		var bookmarks = await GetMyBookmarks();

		var paginator = new Paginator(parameters);

		var query = Query().AsNoTracking();

		if (parameters.OnlyBookmarks)
		{
			var bookmarkIds = bookmarks.Select(x => x.EntityId).ToList();
			query = query.WhereIf(parameters.OnlyBookmarks, x => bookmarkIds.Contains(x.Id));
		}

		if (parameters.DocumentType.HasValue())
		{
			var documentType = (DocumentType)Enum.Parse(typeof(DocumentType), parameters.DocumentType);
			query = query.Where(x => x.Type == documentType);
		}

		if (parameters.Sectional.HasValue())
		{
			query = query.Where(x => x.Sectional == parameters.Sectional);
		}

		if (parameters.NumberFrom > 0)
		{
			query = query.Where(x => x.Number >= parameters.NumberFrom);
		}
		if (parameters.NumberTo > 0)
		{
			query = query.Where(x => x.Number <= parameters.NumberTo);
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
				var number = itemPattern.IsNumeric() ? Convert.ToInt32(itemPattern) : 0;

				query = query.Where(x =>
					(x.Sectional != null && x.Sectional.Contains(itemPattern))
					|| (number > 0 && x.Number == number)
					|| (number > 0 && x.Date.Year == number)
					|| (x.Client != null && x.Client.CompanyName.Contains(itemPattern))
				);
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			//switch (parameters.OrderBy)
			//{
			//	case $"{nameof(Document.Name)}Asc":
			//		{
			//			query = query.OrderBy(x => x.Name);
			//			break;
			//		}
			//	case $"{nameof(Document.Name)}Desc":
			//		{
			//			query = query.OrderByDescending(x => x.Name);
			//			break;
			//		}
			//}
		}
		else
			query = query.OrderByDescending(x => x.Sectional)
				.ThenByDescending(x => x.Number);

		try
		{
			query = query.TakePage(parameters);

			var list = await query.ToListAsync();

			var model = await list.ToModelAsync(bookmarks);

			var result = model.ToPaginatedList(totalCount, parameters);

			return result;
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex);
			throw;
		}
	}

	public async Task<Result> SaveAsync(DocumentRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new Document
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.DocumentRefId = model.DocumentRefId;
		record.Type = (DocumentType)Enum.Parse(typeof(DocumentType), model.Type);
		record.Status = (DocumentStatus)Enum.Parse(typeof(DocumentStatus), model.Status);
		record.ClientId = model.ClientId;
		record.IdSdi = model.IdSdi;
		record.Date = model.Date;
		record.Sectional = model.Sectional;
		record.Number = model.Number;
		record.DiscountPercentage = model.DiscountPercentage;
		record.Discount = model.Discount;
		record.Amount = model.Amount;
		record.VatRate = model.VatRate;
		record.Vat = model.Vat;
		record.AliquotaRitenutaDiAcconto = model.AliquotaRitenutaDiAcconto;
		record.RitenutaDiAcconto = model.RitenutaDiAcconto;
		record.TotalExemptExpenses = model.TotalExemptExpenses;
		record.TotalExpenses = model.TotalExpenses;
		record.Total = model.Total;
		record.ImportoBollo = model.ImportoBollo;
		record.DesTipoPagamento = model.DesTipoPagamento;
		record.Saldato = model.Saldato;
		record.DataIncasso = model.DataIncasso;
		record.CollaboratorId = model.CollaboratorId;
		record.SdiCodiceTipoPagamento = model.SdiCodiceTipoPagamento;
		record.SdiValoreTipoPagamento = model.SdiValoreTipoPagamento;
		record.SdiCodiceCondizionePagamento = model.SdiCodiceCondizionePagamento;
		record.DataScadenzaPagamento = model.DataScadenzaPagamento;
		record.IdDocumento = model.IdDocumento;
		record.Cig = model.Cig;
		record.Cup = model.Cup;

		await entityTagService.UpdateTagsAsync(nameof(Service), record.Id, model.Tags);

		await dbContext.SaveChangesAsync();

		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}