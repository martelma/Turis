using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IPriceListService : IService
{
	Task<Result<PriceListModel>> GetAsync(Guid id);
	Task<Result<PriceListModel>> GetAsync(string codeIso);
	Task<Result<PaginatedList<PriceListModel>>> ListAsync(PriceListSearchParameters parameters);
	Task<Result> SaveAsync(PriceListRequest model);
	Task<Result> DeleteAsync(Guid id);
}