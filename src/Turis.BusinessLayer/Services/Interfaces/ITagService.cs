using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface ITagService : IService
{
	Task<Result<TagModel>> GetAsync(Guid id);
	Task<Result<PaginatedList<TagModel>>> ListAsync(TagSearchParameters parameters);
	Task<Result> SaveAsync(TagRequest model);
	Task<Result> DeleteAsync(Guid id);
}