using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Exceptions;
using JeMa.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Resources;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Enums;
using Turis.Common.Models;
using Turis.Common.Models.Keyless;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class ContactService(ApplicationDbContext dbContext
	, ILogger<ContactService> logger
	, IUserService userService
	, IBookmarkService bookmarkService
	, IAttachmentService attachmentService
	, IEntityTagService entityTagService
	, ITrackingService trackingService
	, IAvatarContactService avatarContactService
	) : IContactService
{
	private const string EntryName = nameof(Contact);

	private async Task<List<Bookmark>> GetMyBookmarks()
		=> await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

	public async Task<Result<TeamSummaryModel>> TeamSummaryAsync(int? year)
	{
		var list = await dbContext.Set<CommissionStat>()
			.FromSqlRaw("EXEC CommissionStats @Year = {0}, @Month = {1}"
				, year.HasValue ? year : DateTime.Now.Year
				, DBNull.Value
			)
			.ToListAsync();

		var contacts = dbContext.GetData<Contact>()
			.Where(x => list.Select(y => y.CollaboratorId).Distinct().Contains(x.Id))
			.ToModel()
			.ToList();

		var model = new TeamSummaryModel();
		foreach (var contact in contacts)
		{
			model.Members.Add(new TeamMemberModel
			{
				Collaborator = contact,
				CommissionStat = list.Where(x=>x.CollaboratorId == contact.Id).ToList()
			});
		}

		return await Task.FromResult<Result<TeamSummaryModel>>(model);
	}

	public async Task<Result<PaginatedList<ContactModel>>> ListAsync(ContactSearchParameters parameters)
	{
		var bookmarks = await GetMyBookmarks();

		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<Contact>()
			.AsQueryable();

		if (parameters.OnlyBookmarks)
		{
			var bookmarkIds = bookmarks.Select(x => x.EntityId).ToList();
			query = query.WhereIf(parameters.OnlyBookmarks, x => bookmarkIds.Contains(x.Id));
		}

		if (parameters.Code.HasValue())
			query = query.Where(x => x.Code.Contains(parameters.Code));

		if (parameters.FirstName.HasValue())
			query = query.Where(x => x.FirstName.Contains(parameters.FirstName));

		if (parameters.LastName.HasValue())
			query = query.Where(x => x.LastName.Contains(parameters.LastName));

		if (parameters.CompanyName.HasValue())
			query = query.Where(x => x.CompanyName.Contains(parameters.CompanyName));

		if (parameters.Note.HasValue())
			query = query.Where(x => x.Note.Contains(parameters.Note));

		if (parameters.Pattern.HasValue())
			query = query.Where(x => x.Code.Contains(parameters.Pattern)
									 || x.FirstName.Contains(parameters.Pattern)
									 || x.LastName.Contains(parameters.Pattern)
									 || x.CompanyName.Contains(parameters.Pattern)
									 || x.Note.Contains(parameters.Pattern));

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			try
			{
				query = query.OrderBy(parameters.OrderBy);
			}
			catch (ParseException ex)
			{
				logger.LogError(ex, Errors.OrderByLoggerError, parameters.OrderBy);
				return Result.Fail(FailureReasons.ClientError, string.Format(Errors.OrderByError, parameters.OrderBy));
			}
		}

		// Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
		var data = query
			.Skip(paginator.PageIndex * paginator.PageSize).Take(paginator.PageSize + 1)
			.ToList();

		var attachments = await attachmentService.ListAsync(EntryName, data.Select(x => x.Id).ToList());
		var tags = await entityTagService.ListAsync(EntryName, data.Select(x => x.Id).ToList());

		var model = data.ToModel(bookmarks, attachments, tags);
		foreach (var item in model)
		{
			item.Avatar = (await avatarContactService.GetAsync(item.Id))?.Content != null
				? (await avatarContactService.GetAsync(item.Id))?.Content.Content.ConvertToBase64String()
				: null;
		}

		var result = new PaginatedList<ContactModel>(model, totalCount, data.Count > parameters.PageSize);
		return result;
	}

	public async Task<Result<ContactModel>> GetAsync(Guid contactId)
	{
		var bookmarks = await GetMyBookmarks();
		var attachments = await attachmentService.ListAsync(EntryName, contactId);
		var tags = await entityTagService.ListAsync(EntryName, contactId);

		var model = dbContext
				.GetData<Contact>()
				.FirstOrDefault(x => x.Id == contactId)
				.ToModel(bookmarks, attachments, tags);

		if (model is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		var avatar = (await avatarContactService.GetAsync(model.Id))?.Content;
		if (avatar != null)
			model.Avatar = avatar.Content.ConvertToBase64String();

		return model;
	}

	public async Task<Result<ContactModel>> SaveAsync(ContactRequest request)
	{
		var record = await dbContext.GetData<Contact>(true)
			.FirstOrDefaultAsync(x => x.Id == request.Id);

		if (record is null)
		{
			record = new Contact();
			dbContext.Insert(record);
		}

		record.Id = request.Id != Guid.Empty ? request.Id : record.Id;
		record.Code = request.Code;
		record.ExternalCode = request.ExternalCode;
		record.Title = request.Title;
		record.Sex = request.Sex;
		record.Languages = request.Languages?.ToCSV();
		//dbContact.LanguageId = contact.LanguageId;
		record.FirstName = request.FirstName;
		record.LastName = request.LastName;
		record.FiscalCode = request.FiscalCode;
		record.TaxCode = request.TaxCode;
		record.CompanyName = request.CompanyName;
		record.BirthDate = request.BirthDate;
		record.BirthPlace = request.BirthPlace;
		record.Address = request.Address;
		record.City = request.City;
		record.Cap = request.Cap;
		record.RegionalCode = request.RegionalCode;
		record.StateCode = request.StateCode;
		record.Phone1 = request.Phone1;
		record.Phone2 = request.Phone2;
		record.Fax = request.Fax;
		record.Web = request.Web;
		record.EMail = request.EMail;
		record.EMailAccounting = request.EMailAccounting;
		record.Pec = request.Pec;
		record.SdiCode = request.SdiCode;
		record.Note = request.Note;
		record.MonitorStat = request.MonitorStat;

		if (request.DocumentType.IsNullOrEmpty())
			record.DocumentType = DocumentType.Undefined;
		else
			record.DocumentType = (DocumentType)Enum.Parse(typeof(DocumentType), request.DocumentType);

		if (request.ContactType.IsNullOrEmpty())
			record.ContactType = ContactType.Undefined;
		else
			record.ContactType = (ContactType)Enum.Parse(typeof(ContactType), request.ContactType);

		record.PercentageGuida = request.PercentageGuida;
		record.PercentageAccompagnamento = request.PercentageAccompagnamento;

		await entityTagService.UpdateTagsAsync(EntryName, record.Id, request.Tags);

		await dbContext.SaveAsync();

		await trackingService.AddOrUpdate(EntryName, record.Id);

		return record.ToModel();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		var deletedRows = await dbContext.GetData<Contact>()
			.Where(r => r.Id == id)
			.ExecuteDeleteAsync();

		if (deletedRows == 0)
			return Result.Fail(FailureReasons.ItemNotFound);

		return Result.Ok();
	}

	public Task<Result<IEnumerable<ContactModel>>> FilterClients(string pattern)
	{
		var query = dbContext.GetData<Contact>()
			.Where(x => x.ContactType == ContactType.Client)
			.Where(x => x.CompanyName.Contains(pattern))
			.OrderBy(x => x.CompanyName)
			;
		var model = query.ToModel().ToList();

		return Task.FromResult<Result<IEnumerable<ContactModel>>>(model);
	}

	public Task<Result<IEnumerable<ContactModel>>> FilterCollaborators(string pattern)
	{
		var query = dbContext.GetData<Contact>()
			.Where(x => x.ContactType == ContactType.Collaborator)
			.Where(x => x.FirstName.Contains(pattern) || x.LastName.Contains(pattern))
			.OrderBy(x => x.FirstName)
			.ThenBy(x => x.LastName)
			;
		var model = query.ToModel().ToList();

		return Task.FromResult<Result<IEnumerable<ContactModel>>>(model);
	}

	public async Task<Result<List<ClientBillingSummaryModel>>> UnbilledSummaryAsync()
	{
		var list = (
			from s in dbContext.GetData<DataAccessLayer.Entities.Service>()
			join di in dbContext.GetData<DocumentItem>() on s.Id equals di.ServiceId into gj
			from subDi in gj.DefaultIfEmpty()
			where subDi == null && s.ClientId != null
			group s by s.Client into g
			select new
			{
				Client = g.Key,
				ServiceCount = g.Count(),
				TotalAmount = g.Sum(x => x.PriceCalculated)
			}
		).ToList();

		var model = new List<ClientBillingSummaryModel>();
		foreach (var item in list)
		{
			model.Add(new ClientBillingSummaryModel
			{
				Client = item.Client.ToModel(),
				ServiceCount = item.ServiceCount,
				TotalAmount = item.TotalAmount
			});
		}

		return model;
	}
}

public class ClientBillingSummaryModel
{
	public ContactModel Client { get; set; }
	public int ServiceCount { get; set; }
	public decimal TotalAmount { get; set; }
}