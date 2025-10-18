using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.Common.Models.Keyless;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class TargetService(ApplicationDbContext dbContext
	, ILogger<TargetService> logger
	, IMediator mediator
	, IEventLogService eventLogService
	, IAvatarContactService avatarContactService
) : ITargetService
{
	private const string EntryName = nameof(Target);

	public async Task<Result<TargetModel>> GetAsync(Guid serviceId)
	{
		var query = dbContext
			.GetData<Target>()
			.Include(x => x.Collaborator)
			.FirstOrDefault(x => x.Id == serviceId);

		var service = await query.ToModelAsync(avatarContactService);

		if (service is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return service;
	}

	public async Task<Result<PaginatedList<TargetModel>>> ListAsync(TargetSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<Target>()
			.Include(x => x.Collaborator)
			.WhereIf(parameters.CollaboratorId.HasValue(), x => x.CollaboratorId == parameters.CollaboratorId)
			.WhereIf(parameters.Year is > 0, x => x.Year == parameters.Year)
			.WhereIf(parameters.Month is > 0, x => x.Month == parameters.Month)
			.AsNoTracking()
			.AsQueryable();

		var totalCount = await query.AsSplitQuery().CountAsync();

		query = query.OrderByDescending(x => x.Year).ThenBy(x => x.Month);

		// Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
		var data = query
			.Skip(paginator.PageIndex * paginator.PageSize).Take(paginator.PageSize + 1)
			.ToList();

		var model = await data.ToModelAsync(avatarContactService);

		var result = new PaginatedList<TargetModel>(model, totalCount, parameters.PageIndex, parameters.PageSize, data.Count > parameters.PageSize);
		return result;
	}

	public async Task<Result<PaginatedList<CommissionStat>>> CommissionStatsAsync(TargetSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var list = await dbContext.Set<CommissionStat>()
			.FromSqlRaw("EXEC CommissionStats @Year = {0}, @Month = {1}, @CollaboratorId = {2}"
				, parameters.Year is > 0 ? parameters.Year.Value : DBNull.Value
				, parameters.Month is > 0 ? parameters.Month.Value : DBNull.Value
				, parameters.CollaboratorId.HasValue() ? parameters.CollaboratorId.Value : DBNull.Value
				)
			.ToListAsync();

		var totalCount = list.Count;

		list = list.OrderByDescending(x => x.Year).ThenBy(x => x.Month).ToList();

		// Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
		var data = list
			.Skip(paginator.PageIndex * paginator.PageSize).Take(paginator.PageSize + 1)
			.ToList();

		var result = new PaginatedList<CommissionStat>(data, totalCount, parameters.PageIndex, parameters.PageSize, data.Count > parameters.PageSize);
		return result;
	}

	public async Task<Result> SaveAsync(TargetRequest request)
	{
		var record = request.Id != Guid.Empty ? await dbContext.GetData<Target>(true)
			.FirstOrDefaultAsync(x => x.Id == request.Id) : null;

		if (record is null)
		{
			record = new Target
			{
				Id = Guid.NewGuid(),
			};
			dbContext.Insert(record);
		}

		record.Id = request.Id != Guid.Empty ? request.Id : record.Id;
		record.CollaboratorId = request.CollaboratorId;
		record.Year = request.Year;
		record.Month = request.Month;
		record.AmountMin = request.AmountMin;
		record.AmountMax = request.AmountMax;
		record.PercentageMin = request.PercentageMin;
		record.PercentageMax = request.PercentageMax;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid targetId)
	{
		var deletedRows = await dbContext.GetData<Target>()
			.Where(r => r.Id == targetId)
			.ExecuteDeleteAsync();

		if (deletedRows == 0)
			return Result.Fail(FailureReasons.ItemNotFound);

		return Result.Ok();
	}
}