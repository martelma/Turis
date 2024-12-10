using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IUserService : IService
{
	Guid GetUserId();
	string GetUserName();
	IEnumerable<string> GetScopes();
}