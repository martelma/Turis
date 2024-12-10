using System.Text.Json;
using JeMa.Shared;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.Authentication.Settings;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common;
using Turis.DataAccessLayer;

namespace Turis.BusinessLayer.Services;

public class AuthService(ApplicationDbContext dbContext,
	UserManager<ApplicationUser> userManager,
	IOptions<AuthenticationSettings> authenticationSettingsOptions,
	SignInManager<ApplicationUser> signInManager,
	IUserService userService,
	IRoleService roleService,
	IHttpContextAccessor httpContextAccessor,
	ITimeLimitedDataProtector timeLimitedDataProtector,
	IMemoryCache memoryCache
	) : BaseService, IAuthService
{
	private readonly AuthenticationSettings authenticationSettings = authenticationSettingsOptions.Value;

	public async Task<Result> InitAuth()
	{
		await AddIfNotExistRole("Admin");
		await AddIfNotExistUser("Mario", "Martellini", "mario", "mario.martellini@gmail.com");

		return await Task.FromResult(Result.Ok());
	}

	private async Task AddIfNotExistRole(string roleName)
	{
		var result = await roleService.GetAsync(authenticationSettings.ApplicationId.Value, roleName);
	}

	private async Task<Result> AddIfNotExistUser(string firstName, string lastName, string userName, string email)
	{
		var obj = await userManager.FindByNameAsync(userName);
		if (obj != null)
			return Result.Ok();

		var user = new ApplicationUser
		{
			UserName = userName,
			Email = email,
			EmailConfirmed = true,
			FirstName = firstName,
			LastName = lastName,
		};

		var result = await userManager.CreateAsync(user, Constants.DefaultPassword);
		if (!result.Succeeded)
			return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));

		return Result.Ok();
	}

	public Task<Result<SecurityCode>> CreateSecurityCodeAsync()
	{
		var userScopes = new UserScopes
		{
			UserId = userService.GetUserId().ToString(),
			Scopes = userService.GetScopes()
		};

		var json = JsonSerializer.Serialize(userScopes);

		var securityCode = new SecurityCode
		{
			Code = timeLimitedDataProtector.Protect(json, DateTime.UtcNow.AddDays(1))
		};

		return Task.FromResult(Result<SecurityCode>.Ok(securityCode));
	}
}
