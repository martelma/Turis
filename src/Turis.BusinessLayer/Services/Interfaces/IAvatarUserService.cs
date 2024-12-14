using Microsoft.AspNetCore.Identity;
using OperationResults;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAvatarUserService : IService
{
	Task<Result<IdentityResult>> SaveAsync(Guid id, Stream stream, string fileName);

	Task<Result<IdentityResult>> DeleteAsync(Guid id);

	Task<Result<StreamFileContent>> GetAsync(Guid id);
}