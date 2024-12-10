using Microsoft.AspNetCore.Http;
using Turis.Authentication.Extensions;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.BusinessLayer.Services;

public class HttpUserService : IUserService
{
	private readonly IHttpContextAccessor httpContextAccessor;

	public HttpUserService(IHttpContextAccessor httpContextAccessor)
	{
		this.httpContextAccessor = httpContextAccessor;
	}
	public Guid GetUserId() => httpContextAccessor.HttpContext.User.GetId();

	public string GetUserName() => httpContextAccessor.HttpContext.User.Identity.Name;

	public IEnumerable<string> GetScopes() => httpContextAccessor.HttpContext.User.GetScopes();
}