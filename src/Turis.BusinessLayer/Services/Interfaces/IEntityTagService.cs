using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IEntityTagService : IService
{
	Task<Result<EntityTagModel>> GetAsync(Guid id);
	Task<Result<EntityTagModel>> GetAsync(string entityName, Guid entityKey);
	Task<Result<PaginatedList<EntityTagModel>>> ListAsync(EntityTagSearchParameters parameters);
	Task<List<EntityTag>> ListAsync(string entityName, Guid entityKey);
	Task<List<EntityTag>> ListAsync(string entityName, List<Guid> entityKeys);
	Task<EntityTag> SaveAsync(EntityTagRequest model);
	Task<Result> DeleteAsync(Guid id);
	Task<Result> DeleteAllAsync(string entityName, Guid entityKey);
	Task UpdateTagsAsync(string entityName, Guid entityKey, List<TagRequest> serviceTags);
}