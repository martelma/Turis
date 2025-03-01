using Microsoft.AspNetCore.Http;
using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAttachmentService : IService
{
	Task<Result<AttachmentModel>> GetAsync(Guid id);
	Task<Result<AttachmentModel>> GetAsync(string entityName, Guid entityKey);
	Task<Result<PaginatedList<AttachmentModel>>> ListAsync(AttachmentSearchParameters parameters);
	Task<List<Attachment>> ListAsync(string entityName, Guid entityKey, string folder = null);
	Task<List<Attachment>> ListAsync(string entityName, List<Guid> entityKeys, string folder = null);
	Task<Attachment> SaveAsync(AttachmentRequest model);
	Task<Result> DeleteAsync(Guid id);
	Task<Result> DeleteAllAsync(string entityName, Guid entityKey, string folder);
	Task<Result<StreamFileContent>> DownloadAllAsync(string entityName, Guid entityKey, string folder);
	Task<Result> Upload(IFormFileCollection files, string entityName, string entityKey, string folder);
}