using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.Common.Models.Responses;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IIdentityService : IService
{
	Task<Result<UserModel>> RegisterAsync(RegisterUserRequest request);

	Task<Result> GeneratePasswordResetTokenAsync(GeneratePasswordResetTokenRequest request);

	Task<Result<LoginResponse>> LoginAsync(LoginRequest request);

	Task<Result<LoginResponse>> AuthenticateAsync();

	Task<Result<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request);

	Task<Result<PaginatedList<UserModel>>> GetUsersAsync(UserSearchParameters parameters);

	Task<Result<UserModel>> GetCurrentUserAsync();

	Task<Result<UserModel>> GetUserAsync(Guid userId);

	Task<Result<UserModel>> GetUserForExternalAsync(Guid userId);
	Task<Result<UserModel>> GetUserMeForExternalAsync(Guid userId);

	Task<Result<PaginatedList<UserModel>>> GetUsersForExternalAsync(IEnumerable<Guid> userIds);

	Task<Result<PaginatedList<UserModel>>> GetUsersForExternalApplicationAsync(Guid applicationId);

	Task<Result<UserModel>> UpdateAsync(UpdateUserRequest request);

	Task<Result> DeleteAsync(Guid id);

	Task<Result> ChangePasswordAsync(ChangePasswordRequest request);

	Task<Result> ResetPasswordAsync(ResetPasswordRequest request);

	Task<Result> ResetDefaultPasswordAsync(ResetDefaultPasswordRequest request);

	Task<Result<OtpResponse>> GenerateOtpAsync();

	Task<Result<LoginResponse>> ValidateOtpAsync(ValidateOtpRequest request);

	Task<Result> CopyUserSettingsAsync(CopyUserSettingsRequest request);

	Task<Result> UpdateLanguageAsync(Guid id, UpdateUserLanguageRequest request);

	Task<Result<SecurityCode>> CreateSecurityCodeAsync();
}
