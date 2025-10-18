using Microsoft.EntityFrameworkCore;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class EventLogService(ApplicationDbContext dbContext, IUserService userService) : IEventLogService
{
	public async Task<Result<PaginatedList<EventLogModel>>> ListAsync(EventLogSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<EventLog>()
			.Include(x => x.User)
			.AsQueryable();

		if (parameters.Pattern.HasValue())
			query = query.Where(x => x.EventName.Contains(parameters.Pattern)
			                         || x.AdditionalInfo.Contains(parameters.Pattern));

		var totalCount = await query.AsSplitQuery().CountAsync();

		query = query.OrderByDescending(x => x.TimeStamp);

		var data = query
			.Skip(paginator.PageIndex * paginator.PageSize).Take(paginator.PageSize + 1)
			.ToList();

		var model = data.ToModel();

		var result = new PaginatedList<EventLogModel>(model, totalCount, parameters.PageIndex, parameters.PageSize, data.Count > parameters.PageSize);
		return result;
	}

	public async Task SaveEventLogAsync(string entityName, string entityKey, string eventName, string additionalInfo, CancellationToken cancellationToken)
	{
		var userId = userService.GetUserId();

		var record = new EventLog
		{
			Id = Guid.NewGuid(),
			UserId = userId,
			TimeStamp = DateTime.UtcNow,

			EntityName = entityName,
			EntityKey = entityKey,
			EventName = eventName,
			AdditionalInfo = additionalInfo
		};

		await dbContext.AddAsync(record, cancellationToken);

		await dbContext.SaveChangesAsync(cancellationToken);
	}
}