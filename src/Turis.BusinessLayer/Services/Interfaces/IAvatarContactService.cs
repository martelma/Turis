using OperationResults;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAvatarContactService : IService
{
	Task<Result> SaveAsync(Guid id, Stream stream, string fileName);

	Task<Result> DeleteAsync(Guid id);

	Task<Result<StreamFileContent>> GetAsync(Guid id);
}