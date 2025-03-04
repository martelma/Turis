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
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class ContactService(IDbContext dbContext
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
			//.ToModel()
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

	public async Task<Result<ContactModel>> SaveAsync(ContactRequest contact)
	{
		var dbContact = await dbContext.GetData<Contact>(true)
			.FirstOrDefaultAsync(x => x.Id == contact.Id);

		if (dbContact is null)
		{
			dbContact = new Contact();
			dbContext.Insert(dbContact);
		}

		dbContact.Id = contact.Id != Guid.Empty ? contact.Id : dbContact.Id;
		dbContact.Code = contact.Code;
		dbContact.ExternalCode = contact.ExternalCode;
		dbContact.Title = contact.Title;
		dbContact.Sex = contact.Sex;
		dbContact.Languages = contact.Languages?.ToCSV();
		//dbContact.LanguageId = contact.LanguageId;
		dbContact.FirstName = contact.FirstName;
		dbContact.LastName = contact.LastName;
		dbContact.FiscalCode = contact.FiscalCode;
		dbContact.TaxCode = contact.TaxCode;
		dbContact.CompanyName = contact.CompanyName;
		dbContact.BirthDate = contact.BirthDate;
		dbContact.BirthPlace = contact.BirthPlace;
		dbContact.Address = contact.Address;
		dbContact.City = contact.City;
		dbContact.Cap = contact.Cap;
		dbContact.RegionalCode = contact.RegionalCode;
		dbContact.StateCode = contact.StateCode;
		dbContact.Phone1 = contact.Phone1;
		dbContact.Phone2 = contact.Phone2;
		dbContact.Fax = contact.Fax;
		dbContact.Web = contact.Web;
		dbContact.EMail = contact.EMail;
		dbContact.EMailAccounting = contact.EMailAccounting;
		dbContact.Pec = contact.Pec;
		dbContact.SdiCode = contact.SdiCode;
		dbContact.Note = contact.Note;

		if (contact.DocumentType.IsNullOrEmpty())
			dbContact.DocumentType = DocumentType.Undefined;
		else
			dbContact.DocumentType = (DocumentType)Enum.Parse(typeof(DocumentType), contact.DocumentType);

		if (contact.ContactType.IsNullOrEmpty())
			dbContact.ContactType = ContactType.Undefined;
		else
			dbContact.ContactType = (ContactType)Enum.Parse(typeof(ContactType), contact.ContactType);

		dbContact.PercentageGuida = contact.PercentageGuida;
		dbContact.PercentageAccompagnamento = contact.PercentageAccompagnamento;

		await entityTagService.UpdateTagsAsync(EntryName, dbContact.Id, contact.Tags);

		await dbContext.SaveAsync();
		
		await trackingService.AddOrUpdate(EntryName, dbContact.Id);

		return dbContact.ToModel();
	}

	public async Task<Result> DeleteAsync(Guid contactId)
	{
		var deletedRows = await dbContext.GetData<Contact>()
			.Where(r => r.Id == contactId)
			.ExecuteDeleteAsync();

		if (deletedRows == 0)
			return Result.Fail(FailureReasons.ItemNotFound);

		return Result.Ok();
	}

	public async Task<Result<IEnumerable<ContactModel>>> FilterClients(string pattern)
	{
		var query = dbContext.GetData<Contact>()
			.Where(x => x.ContactType == ContactType.Client)
			.Where(x => x.CompanyName.Contains(pattern))
			.OrderBy(x => x.CompanyName)
			;
		var model = query.ToModel().ToList();

		return model;
	}

	public async Task<Result<IEnumerable<ContactModel>>> FilterCollaborators(string pattern)
	{
		var query = dbContext.GetData<Contact>()
			.Where(x => x.ContactType == ContactType.Collaborator)
			.Where(x => x.FirstName.Contains(pattern) || x.LastName.Contains(pattern))
			.OrderBy(x => x.FirstName)
			.ThenBy(x => x.LastName)
			;
		var model = query.ToModel().ToList();

		return model;
	}
}