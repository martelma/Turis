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

public class ServiceService(IDbContext dbContext,
	ILogger<ServiceService> logger,
	IBookmarkService bookmarkService,
	IUserService userService,
	IAvatarContactService avatarContactService
	) : IServiceService
{
	public async Task<Result<PaginatedList<ServiceModel>>> ListAsync(ServiceSearchParameters parameters)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), nameof(Service));

		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<Service>()
			.Include(x => x.PriceList)
			.Include(x => x.Client)
			.Include(x => x.Collaborator)
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

		var model = await data.ToModel(bookmarks, avatarContactService);

		//foreach (var item in model.Where(x => x.Collaborator != null))
		//{
		//	item.Collaborator.Avatar = (await avatarContactService.GetAsync(item.Collaborator.Id))?.Content != null
		//		? (await avatarContactService.GetAsync(item.Collaborator.Id))?.Content.Content.ConvertToBase64String()
		//		: null;
		//}


		var result = new PaginatedList<ServiceModel>(model, totalCount, data.Count > parameters.PageSize);
		return result;
	}

	public async Task<Result<ServiceModel>> GetAsync(Guid serviceId)
	{
		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), nameof(Service));

		var query = dbContext.GetData<Service>()
			.Include(x => x.PriceList)
			.Include(x => x.Client)
			.Include(x => x.Collaborator)
			.Where(x => x.Id == serviceId)
			.FirstOrDefault();


		var service = await query.ToModelAsync(bookmarks, avatarContactService);

		if (service is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return service;
	}

	public async Task<Result<ServiceModel>> SaveAsync(ServiceRequest service)
	{
		var dbService = await dbContext.GetData<Service>(true)
			.FirstOrDefaultAsync(x => x.Id == service.Id);

		if (dbService is null)
		{
			dbService = new Service
			{
				Id = Guid.NewGuid()
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
		dbService.Languages = service.Languages.ToCSV();
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
			dbService.Status = ServiceStatus.Undefined;
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

		await dbContext.SaveAsync();

		service.Id = dbService.Id;

		var bookmarks = await bookmarkService.ListAsync(userService.GetUserId(), nameof(Service));
		return await dbService.ToModelAsync(bookmarks, avatarContactService);
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