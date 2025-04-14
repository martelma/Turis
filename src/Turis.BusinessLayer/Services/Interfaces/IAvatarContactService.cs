using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAvatarContactService : IService
{
	Task<Result> SaveAsync(Guid id, Stream stream, string fileName);
	Task<Result> DeleteAsync(Guid id);
	Task<Result<StreamFileContent>> GetAsync(ContactModel item);
	Task<Result<StreamFileContent>> GetAsync(string code, string sex);
	Task<Result<StreamFileContent>> GetAsync(Guid id);
	Task<Result<StreamFileContent>> GetByCodeAsync(string code);
	Task<Result<StreamFileContent>> GetGeneric(string sex);
}