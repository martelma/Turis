using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAliquotaIvaService : IService
{
	Task<Result<AliquotaIvaModel>> GetAsync(Guid id);
	Task<Result<AliquotaIvaModel>> GetAsync(string code);
	Task<Result<PaginatedList<AliquotaIvaModel>>> ListAsync(AliquotaIvaSearchParameters parameters);
	Task<Result> SaveAsync(AliquotaIvaRequest model);
	Task<Result> DeleteAsync(Guid id);
}