using OperationResults;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IUserSettingService : IService
{
	Task<Result> SetValueAsync(string field, string value);
	Task<Result<string>> GetValueAsync(string field);
}