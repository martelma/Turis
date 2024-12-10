using OperationResults;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IAuthService : IService
{
	Task<Result> InitAuth();
    Task<Result<SecurityCode>> CreateSecurityCodeAsync();
    //Task<Result<UserModel>> MeAsync(Guid userId);
    //Task<Result<UserModel>> GetUserAsync(Guid userId);
    //Task<Result<PaginatedList<UserModel>>> GetUsersAsync(IEnumerable<Guid> userIds);
}