using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IEventLogService : IService
{
    //Task<Result<IEnumerable<EventLogModel>>> ListAsync(string entityName, string entityKey);
    Task<Result<PaginatedList<EventLogModel>>> ListAsync(EventLogSearchParameters parameters);

	Task SaveEventLogAsync(string entityName, string entityKey, string eventName, string additionalInfo, CancellationToken cancellationToken);
}
