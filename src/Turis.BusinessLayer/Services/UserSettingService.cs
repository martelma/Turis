using JeMa.Shared.AspNetCore.Extensions;
using Microsoft.AspNetCore.Http;
using OperationResults;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common;
using Turis.DataAccessLayer;

namespace Turis.BusinessLayer.Services;

public class UserSettingService(ApplicationDbContext dbContext,
	RedisService redisService,
	IHttpContextAccessor httpContextAccessor) : IUserSettingService
{
	private readonly HttpContext httpContext = httpContextAccessor.HttpContext;

	public async Task<Result> SetValueAsync(string field, string value)
	{
		var userName = ClaimsExtensions.GetUserName(httpContext.User);
		var key = $"{Constants.UserSettings}:{userName}";

		await redisService.HashAddAsync(key, field, value);

		return Result.Ok();
	}

	public async Task<Result<string>> GetValueAsync(string field)
	{
		var userName = ClaimsExtensions.GetUserName(httpContext.User);
		var key = $"{Constants.UserSettings}:{userName}";

		var value = await redisService.HashGetAsync(key, field);
		return value.ToString();
	}
}