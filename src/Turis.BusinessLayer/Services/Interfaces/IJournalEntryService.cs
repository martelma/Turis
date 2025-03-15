using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IJournalEntryService : IService
{
	Task<Result<JournalEntrySummaryModel>> Summary();
	Task<Result<JournalEntryModel>> GetAsync(Guid id);
	Task<Result<PaginatedList<JournalEntryModel>>> ListAsync(JournalEntrySearchParameters parameters);
	Task<Result> SaveAsync(JournalEntryRequest model);
	Task<Result> DeleteAsync(Guid id);
}