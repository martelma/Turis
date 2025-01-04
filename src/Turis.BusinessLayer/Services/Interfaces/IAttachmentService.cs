using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAttachmentService : IService
{
	Task<Result<AttachmentModel>> GetAsync(Guid id);
	Task<Result<AttachmentModel>> GetAsync(string entityName, Guid entityKey);
	Task<Result<PaginatedList<AttachmentModel>>> ListAsync(AttachmentSearchParameters parameters);
	Task<Result<IEnumerable<AttachmentModel>>> ListAsync(string entityName, Guid entityKey, string folder = null);
	Task<Result> SaveAsync(AttachmentRequest model);
	Task<Result> DeleteAsync(Guid id);
	Task<Result> DeleteAllAsync(string entityName, Guid entityKey, string folder);
}