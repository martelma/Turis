using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IDocumentService : IService
{
	Task<Result<DocumentModel>> GetAsync(Guid id);
	Task<Result<DocumentModel>> GetAsync(string sectional, int number);
	Task<Result<PaginatedList<DocumentModel>>> ListAsync(DocumentSearchParameters parameters);
	Task<Result> SaveAsync(DocumentRequest model);
	Task<Result> DeleteAsync(Guid id);
}