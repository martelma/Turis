using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Exceptions;
using System.Security.Claims;
using System.Text.Json;
using JeMa.Shared;
using JeMa.Shared.AspNetCore;
using JeMa.Shared.Extensions;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OperationResults;
using SimpleAuthentication.JwtBearer;
using TinyHelpers.Extensions;
using Turis.Authentication.Entities;
using Turis.Authentication.Extensions;
using Turis.Authentication.Settings;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.BusinessLayer.Settings;
using Turis.Common;
using Turis.Common.Enums;
using Turis.Common.Mailing;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.Common.Models.Responses;
using Turis.DataAccessLayer;
using Turis.BusinessLayer.Resources;

namespace Turis.BusinessLayer.Services;

public class IdentityService(ApplicationDbContext dbContext,
	UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
	ITimeLimitedDataProtector timeLimitedDataProtector,
	ITimeLimitedDataProtector dataProtector,
	IOptions<AuthenticationSettings> authenticationSettingsOptions,
	IOptions<JwtBearerSettings> jwtBearerSettingsOptions,
	IOptions<AppSettings> appSettingsOptions,
	IHttpContextAccessor httpContextAccessor,
	IAvatarUserService avatarUserService,
	IJwtBearerService jwtBearerService,
	IEmailService emailService,
	ILogger<IdentityService> logger) : IIdentityService
{
	private readonly AuthenticationSettings authenticationSettings = authenticationSettingsOptions.Value;
	private readonly JwtBearerSettings jwtBearerSettings = jwtBearerSettingsOptions.Value;
	private readonly HttpContext httpContext = httpContextAccessor.HttpContext;
	private readonly AppSettings appSettings = appSettingsOptions.Value;

	public async Task<Result<UserModel>> RegisterAsync(RegisterUserRequest request)
	{
		request.Email = request.Email.ToLowerInvariant();
		var user = new ApplicationUser
		{
			Id = Guid.NewGuid(),
			FirstName = request.FirstName,
			LastName = request.LastName,
			UserName = request.UserName,
			Email = request.Email,
			EmailConfirmed = true,
			Language = request.Language,
			LockoutEnd = request.IsActive ? null : DateTimeOffset.MaxValue
		};

		var result = await userManager.CreateAsync(user, Constants.DefaultPassword);
		if (result.Succeeded)
		{
			// Retrieves the roles selected for the user and adds them to the list.
			var roles = new List<ApplicationRole>();
			if (!request.Roles.Any())
				// If no role is given, add the User role in Workspace by default
				roles = await dbContext.Roles
					.Include(x => x.Application)
					.Where(r => r.Name == "User" && r.Application.Name == "Workspace")
					.ToListAsync();
			else
				roles = await dbContext.Roles
					.Include(x => x.Application)
					.Where(r => request.Roles.Contains(r.Id.ToString()))
					.ToListAsync();

			foreach (var role in roles)
			{
				dbContext.UserRoles.Add(new() { User = user, Role = role });
			}

			await dbContext.SaveAsync();

			var userRegisteredModel = new UserRegisteredEmailModel
			{
				FirstName = user.FirstName,
				TemporaryPassword = Constants.DefaultPassword,
				CallbackUrl = $"{appSettings.ApplicationUrl}"
			};

			await emailService.SendTemplateEmailAsync(user.FirstName, user.Email, Account.UserRegisteredTitle, "UserRegistered", userRegisteredModel);

			var applicationUser = await GetUserAsync(user.Id);
			return applicationUser;
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	public async Task<Result> GeneratePasswordResetTokenAsync(GeneratePasswordResetTokenRequest request)
	{
		var user = await userManager.FindByEmailAsync(request.Email);
		if (user is not null)
		{
			var passwordResetToken = await userManager.GeneratePasswordResetTokenAsync(user);

			var passwordRecoveryModel = new PasswordRecoveryEmailModel
			{
				FirstName = user.FirstName,
				PasswordRecoveryCode = passwordResetToken,
				CallbackUrl = $"{appSettings.PasswordRecoveryCallbackUrl}?userId={user.Id}&token={passwordResetToken}"
			};

			await emailService.SendTemplateEmailAsync(user.FirstName, user.Email, Account.ResetPasswordTitle, "PasswordRecovery", passwordRecoveryModel);
		}

		return Result.Ok();
	}

	public async Task<Result<UserModel>> UpdateAsync(UpdateUserRequest request)
	{
		var user = await dbContext.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == request.UserId);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		user.UserName = request.UserName;
		user.FirstName = request.FirstName;
		user.LastName = request.LastName;
		user.Email = request.Email.ToLowerInvariant();
		user.Language = request.Language;
		user.LockoutEnd = request.IsActive ? null : DateTimeOffset.MaxValue;

		var result = await userManager.UpdateAsync(user);
		if (result.Succeeded)
		{
			// Retrieves the roles selected for the user and adds them to the list.
			dbContext.UserRoles.RemoveRange(user.UserRoles);

			var roles = await dbContext.Roles.Where(r => request.Roles.Contains(r.Id.ToString())).ToListAsync();
			foreach (var role in roles)
			{
				dbContext.UserRoles.Add(new() { User = user, Role = role });
			}

			await dbContext.SaveAsync();

			var applicationUser = await GetUserAsync(request.UserId);
			return applicationUser;
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		var user = await dbContext.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var result = await userManager.DeleteAsync(user);
		if (result.Succeeded)
		{
			return Result.Ok();
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request)
	{
		// Perform login by user name or email
		var user = await userManager.FindByNameAsync(request.UserName);
		if (user is null)
		{
			user = await userManager.FindByEmailAsync(request.UserName);
			if (user is null)
				return Result.Fail(FailureReasons.ClientError, Account.ErrorLoginUserPassword);
		}

//#if DEBUG
//		return await LoginAsync(user);
//#endif
        var signInResult = await signInManager.PasswordSignInAsync(user, request.Password, false, lockoutOnFailure: true);
        if (signInResult.Succeeded && user.PasswordExpiration.GetValueOrDefault(DateTime.MinValue) < DateTime.UtcNow)
        {
            // Il login ha avuto successo, ma la password è scaduta.
            var token = await userManager.GeneratePasswordResetTokenAsync(user);

            var response = new LoginResponse
            {
                UserId = user.Id,
                PasswordExpiration = user.PasswordExpiration,
                ChangePasswordToken = token
            };

            return response;
        }

        if (!signInResult.Succeeded)
        {
            if (signInResult.IsLockedOut)
            {
                return Result.Fail(CustomFailureReasons.LockedOut);
            }

            return Result.Fail(FailureReasons.ClientError, Account.ErrorLoginUserPassword);
        }

        var result = await LoginAsync(user);
        return result;
	}

	public async Task<Result<LoginResponse>> AuthenticateAsync()
	{
		var email = httpContext.User.Identity.Name;
		var user = await userManager.FindByEmailAsync(email);
		if (user is null)
		{
			return Result.Fail(FailureReasons.Unauthorized);
		}

		var loginResponse = await LoginAsync(user);
		return loginResponse;
	}

	private async Task<Result<LoginResponse>> LoginAsync(ApplicationUser user)
	{
		var userRoles = await dbContext.UserRoles
			.Include(ur => ur.Role.Application)
			.Include(ur => ur.Role.Scopes)
			.ThenInclude(x => x.Scope)
			.Where(ur => ur.UserId == user.Id)
			.Select(ur => ur.Role)
			.ToListAsync();

		var claims = new Claim[]
		{
			new(ClaimTypes.NameIdentifier, user.Id.ToString()),
			new(ClaimTypes.Name, user.UserName),
			new(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
			new(ClaimTypes.Surname, user.LastName ?? string.Empty),
			new(ClaimTypes.Locality, user.Language ?? string.Empty)
		}
		.Union(userRoles.Select(r => r.ApplicationId).Distinct().Select(a => new Claim(ClaimNames.Application, a.ToString())))
		.Union(userRoles.Select(r => new Claim(ClaimTypes.Role, $"{r.ApplicationId}:{r.Name}")))
		.Union(userRoles.SelectMany(r => r.Scopes.Select(s => new Claim(ClaimNames.Scope, $"{r.ApplicationId}:{s.Scope.Name}"))))
		.ToList();

		await userManager.UpdateSecurityStampAsync(user);

		var loginResponse = CreateToken(user, claims);
		return loginResponse;
	}

	public async Task<Result<PaginatedList<UserModel>>> GetUsersAsync(UserSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = dbContext.GetData<ApplicationUser>();
		var totalCount = await query.CountAsync();

		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
				query = query.Where(x =>
						(x.FirstName != null && x.FirstName.Contains(itemPattern))
						|| (x.LastName != null && x.LastName.Contains(itemPattern))
						|| (x.UserName != null && x.UserName.Contains(itemPattern))
						|| (x.Email != null && x.Email.Contains(itemPattern)));

		if (parameters.OrderBy.HasValue())
		{
			try
			{
				query = query.OrderBy(parameters.OrderBy);
			}
			catch (ParseException ex)
			{
				logger.LogError(ex, Errors.OrderByLoggerError, parameters.OrderBy);
				return Result.Fail(FailureReasons.ClientError, string.Format(Errors.OrderByError, parameters.OrderBy));
			}
		}
		else
			query = query.OrderBy(x => x.UserName);

		var data = await query
			.Skip(paginator.PageIndex * paginator.PageSize).Take(paginator.PageSize + 1)
			.SelectAsync(async u => new UserModel
			{
				Id = u.Id,
				UserName = u.UserName,
				FirstName = u.FirstName,
				LastName = u.LastName,
				Email = u.Email,
				Language = u.Language,
				IsActive = u.LockoutEnd.GetValueOrDefault(DateTimeOffset.MinValue) < DateTime.UtcNow,
				AccountType = u.PasswordHash != null ? AccountType.Local : AccountType.AzureActiveDirectory,
				Avatar = (await avatarUserService.GetAsync(u.Id))?.Content != null ? (await avatarUserService.GetAsync(u.Id))?.Content.Content.ConvertToBase64String() : null
			});

		var result = new PaginatedList<UserModel>(data.ToList().Take(paginator.PageSize), totalCount, paginator.PageIndex, paginator.PageSize);
		return result;
	}

	public async Task<Result<UserModel>> GetCurrentUserAsync()
	{
		var user = (await GetUserAsync(ClaimExtensions.GetId(httpContext.User)))?.Content;
		return user;
	}

	public async Task<Result<UserModel>> GetUserAsync(Guid userId)
	{
		var dbUser = await dbContext.GetData<ApplicationUser>()
			.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.Application)
			.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.Scopes).ThenInclude(rs => rs.Scope)
			.FirstOrDefaultAsync(u => u.Id == userId);

		if (dbUser is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var applications = dbUser.UserRoles.Select(r => r.Role.Application).DistinctBy(a => a.Id).OrderBy(a => a.Name);

		var user = new UserModel
		{
			Id = dbUser.Id,
			UserName = dbUser.UserName,
			FirstName = dbUser.FirstName,
			LastName = dbUser.LastName,
			Email = dbUser.Email,
			Language = dbUser.Language,
			IsActive = dbUser.LockoutEnd.GetValueOrDefault(DateTimeOffset.MinValue) < DateTime.UtcNow,
			AccountType = dbUser.PasswordHash != null ? AccountType.Local : AccountType.AzureActiveDirectory,
			Applications = applications.Select(a => new ApplicationModel
			{
				Id = a.Id,
				Name = a.Name,
				Description = a.Description,
				Icon = a.Icon,
				Url = a.Url,
				ViewOrder = a.ViewOrder,
				Roles = dbUser.UserRoles.Where(ur => ur.Role.ApplicationId == a.Id).Select(ur => new ApplicationRoleModel
				{
					Id = ur.Role.Id,
					Name = ur.Role.Name,
					Description = ur.Role.Description,
					Scopes = ur.Role.Scopes.Select(s => new ApplicationScopeModel
					{
						Id = s.Scope.Id,
						RoleIds = ur.Role.Scopes.Select(urs => urs.RoleId).ToList(),
						Name = s.Scope.Name
					})
					.OrderBy(s => s.Name).ToList(),
				}).OrderBy(r => r.Name).ToList()
			}).ToList(),
		};

		var avatar = (await avatarUserService.GetAsync(user.Id))?.Content;
		if (avatar != null)
			user.Avatar = avatar.Content.ConvertToBase64String();

		return user;
	}

	public async Task<Result<UserModel>> GetUserMeForExternalAsync(Guid userId)
	{
		var user = (await GetUserAsync(userId))?.Content;
		return user;
	}

	public async Task<Result<UserModel>> GetUserForExternalAsync(Guid userId)
	{
		var dbUser = await dbContext.GetData<ApplicationUser>()
			.FirstOrDefaultAsync(u => u.Id == userId);

		if (dbUser is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var user = new UserModel
		{
			Id = dbUser.Id,
			UserName = dbUser.UserName,
			FirstName = dbUser.FirstName,
			LastName = dbUser.LastName,
			Email = dbUser.Email,
			Language = dbUser.Language,
			IsActive = true,
		};

		return user;
	}

	public async Task<Result<PaginatedList<UserModel>>> GetUsersForExternalAsync(IEnumerable<Guid> userIds)
	{
		var users = await dbContext.GetData<ApplicationUser>()
			.Where(u => userIds.Contains(u.Id))
			.Select(u => new UserModel
			{
				Id = u.Id,
				UserName = u.UserName,
				FirstName = u.FirstName,
				LastName = u.LastName,
				Email = u.Email,
				Language = u.Language,
				IsActive = true,
			})
			.ToListAsync();

		var paginatedList = new PaginatedList<UserModel>(users);

		return paginatedList;
	}

	public async Task<Result<PaginatedList<UserModel>>> GetUsersForExternalApplicationAsync(Guid applicationId)
	{
		var users = await dbContext.GetData<ApplicationUser>()
			.Where(u => u.UserRoles.Any(r => r.Role.ApplicationId == applicationId))
			.Select(u => new UserModel
			{
				Id = u.Id,
				UserName = u.UserName,
				FirstName = u.FirstName,
				LastName = u.LastName,
				Email = u.Email,
				Language = u.Language,
				IsActive = true,
			})
			.ToListAsync();

		var paginatedList = new PaginatedList<UserModel>(users);

		return paginatedList;
	}

	public async Task<Result> ChangePasswordAsync(ChangePasswordRequest request)
	{
		var userId = ClaimExtensions.GetId(httpContext.User).ToString();
		var user = await userManager.FindByIdAsync(userId);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var result = await userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
		if (result.Succeeded)
		{
			await UpdatePasswordExpirationAsync(user);
			return Result.Ok();
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	public async Task<Result> ResetPasswordAsync(ResetPasswordRequest request)
	{
		var userId = request.UserId.ToString();
		var user = await userManager.FindByIdAsync(userId);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var result = await userManager.ResetPasswordAsync(user, request.Token, request.Password);
		if (result.Succeeded)
		{
			await UpdatePasswordExpirationAsync(user);
			return Result.Ok();
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	public async Task<Result> ResetDefaultPasswordAsync(ResetDefaultPasswordRequest request)
	{
		var user = await userManager.FindByIdAsync(request.UserId.ToString());
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var passwordResetToken = await userManager.GeneratePasswordResetTokenAsync(user);

		var result = await userManager.ResetPasswordAsync(user, passwordResetToken, Constants.DefaultPassword);
		if (result.Succeeded)
		{
			await UpdatePasswordExpirationAsync(user);
			return Result.Ok();
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	private async Task UpdatePasswordExpirationAsync(ApplicationUser user)
	{
		user.PasswordExpiration = DateTime.UtcNow.AddDays(authenticationSettings.Password.ExpirationDays);
		await userManager.UpdateAsync(user);
	}

	public async Task<Result<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request)
	{
		if (jwtBearerService.TryValidateToken(request.AccessToken, validateLifetime: false, out var user))
		{
			try
			{
				var userId = dataProtector.Unprotect(request.RefreshToken);
				if (ClaimExtensions.GetId(user).ToString() == userId)
				{
					var dbUser = await userManager.FindByIdAsync(userId);

					// Check if the user is actually active or not.
					// Otherwise, the user can repeatedly access to the application even if he was disabled
					if (dbUser is not null && dbUser.LockoutEnd.GetValueOrDefault() < DateTime.UtcNow)
					{
						// Il refresh token è valido.
						var loginResponse = CreateToken(dbUser, user.Claims.ToList());
						return loginResponse;
					}
				}
			}
			catch
			{
			}
		}

		return Result.Fail(CustomFailureReasons.InvalidToken);
	}

	public Task<Result<OtpResponse>> GenerateOtpAsync()
	{
		var userId = ClaimExtensions.GetId(httpContext.User).ToString();
		var otp = dataProtector.Protect(userId, authenticationSettings.OtpExpirationTime);

		var response = new OtpResponse { Token = otp };
		return Task.FromResult(Result<OtpResponse>.Ok(response));
	}

	public async Task<Result<LoginResponse>> ValidateOtpAsync(ValidateOtpRequest request)
	{
		try
		{
			var userId = dataProtector.Unprotect(request.Token);

			var user = await userManager.FindByIdAsync(userId);
			if (user is not null)
			{
				var loginResponse = await LoginAsync(user);
				return loginResponse;
			}
		}
		catch
		{
		}

		return Result.Fail(FailureReasons.ClientError);
	}

	private LoginResponse CreateToken(ApplicationUser user, IList<Claim> claims)
	{
		var now = DateTime.UtcNow;
		var tokenExpiration = now.Add(jwtBearerSettings.ExpirationTime.GetValueOrDefault(TimeSpan.FromDays(1)));

		var refrehTokenExpiration = now.Add(authenticationSettings.RefreshTokenExpirationTime);
		var refreshToken = dataProtector.Protect(user.Id.ToString(), refrehTokenExpiration);

		var token = jwtBearerService.CreateToken(user.UserName, claims, absoluteExpiration: tokenExpiration);

		var loginResponse = new LoginResponse
		{
			UserId = user.Id,
			FirstName = user.FirstName,
			LastName = user.LastName,
			AccessToken = token,
			RefreshToken = refreshToken,
			TokenExpiration = tokenExpiration,
			RefreshTokenExpiration = refrehTokenExpiration,
			PasswordExpiration = user.PasswordExpiration
		};

		return loginResponse;
	}

	public async Task<Result> CopyUserSettingsAsync(CopyUserSettingsRequest request)
	{
		var sourceUser = await dbContext.Users
			.Include(u => u.UserRoles)
			.ThenInclude(x => x.Role)
			.FirstOrDefaultAsync(u => u.Id == request.UserSourceId);

		if (sourceUser is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var userTarget = await dbContext.Users
			.Include(u => u.UserRoles)
			.ThenInclude(x => x.Role)
			.FirstOrDefaultAsync(u => u.Id == request.UserTargetId);

		if (userTarget is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		// Retrieves the roles selected for the user and adds them to the list.
		dbContext.UserRoles.RemoveRange(userTarget.UserRoles.Where(r => r.Role.ApplicationId == request.ApplicationId));

		var userRoleIds = sourceUser.UserRoles
			.Where(ur => ur.Role.ApplicationId == request.ApplicationId)
			.Select(ur => ur.RoleId)
			.ToList();

		var rolesToCopy = await dbContext.Roles
					.Include(x => x.Application)
					.Where(r => userRoleIds.Contains(r.Id))
					.ToListAsync();

		foreach (var role in rolesToCopy)
		{
			dbContext.UserRoles.Add(new() { User = userTarget, Role = role });
		}

		await dbContext.SaveAsync();

		return Result.Ok();
	}

	public async Task<Result> UpdateLanguageAsync(Guid id, UpdateUserLanguageRequest request)
	{
		var user = await dbContext.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		user.Language = request.Language;

		var result = await userManager.UpdateAsync(user);
		if (result.Succeeded)
		{
			return Result.Ok();
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}

	public Task<Result<SecurityCode>> CreateSecurityCodeAsync()
	{
		var userScopes = new UserScopes
		{
			UserId = ClaimExtensions.GetId(httpContext.User).ToString(),
			Scopes = ClaimExtensions.GetScopes(httpContext.User)
		};

		var json = JsonSerializer.Serialize(userScopes);

		var securityCode = new SecurityCode
		{
			Code = timeLimitedDataProtector.Protect(json, DateTime.UtcNow.AddDays(1))
		};

		return Task.FromResult(Result<SecurityCode>.Ok(securityCode));
	}
}

public class SecurityCode
{
	public string Code { get; set; }
}