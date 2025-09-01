using Microsoft.EntityFrameworkCore;
using OperationResults;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class EventLogService(ApplicationDbContext dbContext, IUserService userService) : IEventLogService
{
	private DbSet<EventLog> Context => dbContext.EventLogs;

	private IQueryable<EventLog> Query()
	{
		return Context
			.Include(x => x.User)
			.AsQueryable();
	}

	public async Task<Result<IEnumerable<EventLogModel>>> ListAsync(string entityName, string entityKey)
	{
		var list = await Query()
			.AsNoTracking()
			.Where(x => x.EntityName == entityName && x.EntityKey == entityKey)
			.OrderBy(x => x.TimeStamp)
			.ToListAsync();

		var model = list.ToModel();

		return Result<IEnumerable<EventLogModel>>.Ok(model);
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