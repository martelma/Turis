using System.Globalization;
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
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class ServiceService(IDbContext dbContext
	, ILogger<ServiceService> logger
	, IUserService userService
	, IBookmarkService bookmarkService
	, IAttachmentService attachmentService
	, IEntityTagService entityTagService
	, IContactService contactService
	, IAvatarContactService avatarContactService
	) : IServiceService
{
	private const string EntryName = nameof(Service);

	private async Task<List<Bookmark>> GetMyBookmarks()
		=> await bookmarkService.ListAsync(userService.GetUserId(), EntryName);

	public async Task<Result<ServiceModel>> GetAsync(Guid serviceId)
	{
		var bookmarks = await GetMyBookmarks();
		var attachments = await attachmentService.ListAsync(EntryName, serviceId);
		var tags = await entityTagService.ListAsync(EntryName, serviceId);

		var query = dbContext
			.GetData<Service>()
			.Include(x => x.PriceList)
			.Include(x => x.Client)
			.Include(x => x.Collaborator)
			.FirstOrDefault(x => x.Id == serviceId);

		var service = await query.ToModelAsync(avatarContactService, bookmarks, attachments, tags);

		if (service is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return service;
	}

	public Task<Result<ServiceSummaryModel>> SummaryAsync()
	{
		var query = dbContext
			.GetData<Service>()
			.Include(x => x.Collaborator)
			.Where(x => x.Date.Year == DateTime.Now.Year);

		var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
		var endOfWeek = startOfWeek.AddDays(7).AddTicks(-1);

		var model = new ServiceSummaryModel
		{
			Proposals = query
				.Count(x => !x.Checked),

			WeekProposals = query
				.Where(x => x.Date >= startOfWeek && x.Date <= endOfWeek)
				.Count(x => !x.Checked),

			Checked = query
				.Count(x => x.Checked),

			CheckedToAssign = query
				.Where(x => x.CollaboratorId == null)
				.Count(x => x.Checked),

			ToDo = query
				.Where(x => x.Checked)
				.Count(x => x.Status == ServiceStatus.Closed),

			WeekToDo = query
				.Where(x => x.Checked)
				.Where(x => x.Date >= startOfWeek && x.Date <= endOfWeek)
				.Count(x => x.Status == ServiceStatus.Closed),

			Done = query
				.Where(x => x.Checked)
				.Count(x => x.Status == ServiceStatus.Closed),

			WeekDone = query
				.Where(x => x.Checked)
				.Where(x => x.Date >= startOfWeek && x.Date <= endOfWeek)
				.Count(x => x.Status == ServiceStatus.Closed),
		};

		return Task.FromResult<Result<ServiceSummaryModel>>(model);
	}

	public async Task<Result<PaginatedList<ServiceModel>>> ListAsync(ServiceSearchParameters parameters)
	{
		var bookmarks = await GetMyBookmarks();

		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<Service>()
			.Include(x => x.PriceList)
			.Include(x => x.Client)
			.Include(x => x.Collaborator)
			.AsNoTracking()
			.AsQueryable();

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

		if (parameters.Code.HasValue())
			query = query.Where(x => x.Code.Contains(parameters.Code));

		if (parameters.Title.HasValue())
			query = query.Where(x => x.Title.Contains(parameters.Title));

		if (parameters.Note.HasValue())
			query = query.Where(x => x.Note.Contains(parameters.Note));

		if (parameters.Pattern.HasValue())
			query = query.Where(x => x.Code.Contains(parameters.Pattern)
			|| x.Title.Contains(parameters.Pattern)
			|| x.Note.Contains(parameters.Pattern));

		if (parameters.ServiceType.HasValue())
		{
			var serviceType = (ServiceType)Enum.Parse(typeof(ServiceType), parameters.ServiceType);
			query = query.Where(x => x.ServiceType == serviceType);
		}

		if (parameters.DurationType.HasValue())
		{
			var durationType = (DurationType)Enum.Parse(typeof(DurationType), parameters.DurationType);
			query = query.Where(x => x.DurationType == durationType);
		}

		var totalCount = await query.AsSplitQuery().CountAsync();

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

		var model = await data.ToModel(avatarContactService, bookmarks, attachments, tags);

		var result = new PaginatedList<ServiceModel>(model, totalCount, data.Count > parameters.PageSize);
		return result;
	}

	public async Task<Result<PaginatedList<ServiceModel>>> AccountStatement(AccountStatementParameters parameters)
	{
		var bookmarks = await GetMyBookmarks();

		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<Service>()
			.Include(x => x.PriceList)
			.Include(x => x.Client)
			.Include(x => x.Collaborator)
			.AsQueryable();

		var contact = (await contactService.GetAsync(parameters.ContactId)).Content;
		if (contact is null)
			throw new Exception("Contact not found");

		if (contact.ContactType == ContactType.Client.ToString())
			query = query.Where(x => x.ClientId == parameters.ContactId);
		else if (contact.ContactType == ContactType.Collaborator.ToString())
			query = query.Where(x => x.CollaboratorId == parameters.ContactId);

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

		if (parameters.ServiceType.HasValue())
		{
			var serviceType = (ServiceType)Enum.Parse(typeof(ServiceType), parameters.ServiceType);
			query = query.Where(x => x.ServiceType == serviceType);
		}

		if (parameters.DurationType.HasValue())
		{
			var durationType = (DurationType)Enum.Parse(typeof(DurationType), parameters.DurationType);
			query = query.Where(x => x.DurationType == durationType);
		}

		var totalCount = await query.AsSplitQuery().CountAsync();

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
		else
			query = query.OrderByDescending(x => x.Date);


		// Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
		var data = query
			.Skip(paginator.PageIndex * paginator.PageSize).Take(paginator.PageSize + 1)
			.ToList();

		var attachments = await attachmentService.ListAsync(EntryName, data.Select(x => x.Id).ToList());
		var tags = await entityTagService.ListAsync(EntryName, data.Select(x => x.Id).ToList());
		var model = await data.ToModel(avatarContactService, bookmarks, attachments, tags);

		var result = new PaginatedList<ServiceModel>(model, totalCount, data.Count > parameters.PageSize);
		return result;
	}

	public Service GetRandom()
	{
		var randomService = dbContext
			.GetData<Service>()
			.Include(x => x.Client)
			.OrderBy(s => Guid.NewGuid()) // Ordina casualmente usando un nuovo GUID
			.FirstOrDefault();
		return randomService;
	}

	public async Task<Result<ContactSummaryModel>> ContactSummaryAsync(Guid contactId)
	{
		var data = await dbContext
			.GetData<Service>()
			.Where(x => x.CollaboratorId == contactId)
			.OrderBy(x => x.Date)
			.ToListAsync();

		var model = new ContactSummaryModel
		{
			Years = data
				.GroupBy(x => x.Date.Year) // Raggruppa per anno
				.Select(yearGroup => new ContactSummaryDataModel
				{
					ViewOrder = yearGroup.Key,
					Label = yearGroup.Key.ToString(),
					Total = yearGroup.Sum(x => x.Commission > 0 ? x.Commission : x.CommissionCalculated), // Calcola il totale per l'anno
					Payed = yearGroup.Where(x => x.CommissionPaid).Sum(x => x.Commission > 0 ? x.Commission : x.CommissionCalculated), // Calcola il totale pagato
					Data = yearGroup
						.GroupBy(x => x.Date.Month) // Raggruppa per mese
						.Select(x => new ContactDataItemModel
						{
							ViewOrder = x.Key, // Numero del mese (1-12)
							Label = new DateTime(1, x.Key, 1).ToString("MMM"), // Nome del mese
							Value = x.Sum(y => y.Commission > 0 ? y.Commission : y.CommissionCalculated) // Totale del valore per il mese
						})
						.OrderBy(x => x.ViewOrder) // Ordina per ordine cronologico
						.ToList()
				})
				.OrderBy(x => x.ViewOrder) // Ordina per anno
				.ThenBy(x => x.Data.FirstOrDefault()?.ViewOrder) // Ordina per mese
				.ToList()
		};

		return model;
	}

	public async Task<Result<ServiceModel>> SaveAsync(ServiceRequest service)
	{
		var dbService = await dbContext.GetData<Service>(true)
			.FirstOrDefaultAsync(x => x.Id == service.Id);

		if (dbService is null)
		{
			dbService = new Service
			{
				Id = Guid.NewGuid(),
				UserId = userService.GetUserId(),
				CreationDate = DateTimeOffset.Now
			};
			dbContext.Insert(dbService);
		}

		dbService.Id = service.Id != Guid.Empty ? service.Id : dbService.Id;
		dbService.Date = service.Date;
		dbService.Code = service.Code;
		dbService.Title = service.Title;

		dbService.ServiceType = (ServiceType)Enum.Parse(typeof(ServiceType), service.ServiceType);
		dbService.DurationType = (DurationType)Enum.Parse(typeof(DurationType), service.DurationType);
		dbService.People = service.People;
		dbService.PriceListId = service.PriceListId;

		dbService.Location = service.Location;
		dbService.Languages = service.Languages?.ToCSV();
		dbService.OptionExpiration = service.OptionExpiration;

		dbService.MeetingPlace = service.MeetingPlace;
		dbService.Referent = service.Referent;
		dbService.ReferentPhone = service.ReferentPhone;

		dbService.ClientId = service.ClientId;

		dbService.Note = service.Note;
		dbService.PriceCalculated = service.PriceCalculated;
		dbService.Price = service.Price;

		dbService.CollaboratorId = service.CollaboratorId;
		dbService.CommissionPercentage = service.CommissionPercentage;
		dbService.CommissionCalculated = service.CommissionCalculated;
		dbService.Commission = service.Commission;
		dbService.CommissionNote = service.CommissionNote;

		if (service.Status.IsNullOrEmpty())
			dbService.Status = ServiceStatus.New;
		else
			dbService.Status = (ServiceStatus)Enum.Parse(typeof(ServiceStatus), service.Status);

		if (service.WorkflowCollaboratorStatus.IsNullOrEmpty())
			dbService.WorkflowCollaboratorStatus = WorkflowCollaboratorStatus.Undefined;
		else
			dbService.WorkflowCollaboratorStatus = (WorkflowCollaboratorStatus)Enum.Parse(typeof(WorkflowCollaboratorStatus), service.WorkflowCollaboratorStatus);

		dbService.Checked = service.Checked;

		dbService.CashedIn = service.CashedIn;
		dbService.CashedDate = service.CashedDate;

		dbService.CommissionPaid = service.CommissionPaid;
		dbService.CommissionPaymentDate = service.CommissionPaymentDate;

		dbService.CIGCode = service.CIGCode;
		dbService.CUPCode = service.CUPCode;

		await entityTagService.UpdateTagsAsync(EntryName, dbService.Id, service.Tags);

		await dbContext.SaveAsync();

		service.Id = dbService.Id;

		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), EntryName);
		var attachments = await attachmentService.ListAsync(EntryName, service.Id);
		var tags = await entityTagService.ListAsync(EntryName, service.Id);
		return await dbService.ToModelAsync(avatarContactService, bookmarks, attachments, tags);
	}

	public async Task<Result> DeleteAsync(Guid serviceId)
	{
		var deletedRows = await dbContext.GetData<Service>()
			.Where(r => r.Id == serviceId)
			.ExecuteDeleteAsync();

		if (deletedRows == 0)
			return Result.Fail(FailureReasons.ItemNotFound);

		return Result.Ok();
	}
}
