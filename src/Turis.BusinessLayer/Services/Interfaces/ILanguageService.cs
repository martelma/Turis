using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface ILanguageService : IService
{
	Task<Result<LanguageModel>> GetAsync(Guid id);
	Task<Result<LanguageModel>> GetAsync(string codeIso);
	Task<Result<PaginatedList<LanguageModel>>> ListAsync(LanguageSearchParameters parameters);
	Task<Result> SaveAsync(LanguageRequest model);
	Task<Result> DeleteAsync(Guid id);
}