using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IBookmarkService : IService
{
	Task<Result> SaveAsync(BookmarkRequest model);
	Task<Result> DeleteAsync(Guid id);
    Task<List<Bookmark>> ListAsync(Guid userId, string entityName);
}