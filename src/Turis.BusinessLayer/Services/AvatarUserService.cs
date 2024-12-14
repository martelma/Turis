using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.BusinessLayer.Services;

public class AvatarUserService(IOptions<CdnSettings> cdnSettings
	, IFileService fileService
	, UserManager<ApplicationUser> userManager) : IAvatarUserService
{
	private readonly CdnSettings cdnSettings = cdnSettings.Value;

	public async Task<Result<IdentityResult>> SaveAsync(Guid id, Stream stream, string fileName)
	{
		var user = await GetApplicationUserAsync(id);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var extension = Path.GetExtension(fileName);
		var relativePath = Path.Combine(cdnSettings.AvatarFolder, $"{id}{extension}");

		await fileService.SaveAsync(relativePath, stream);
		user.AvatarUrl = relativePath;

		return await userManager.UpdateAsync(user);
	}

	public async Task<Result<IdentityResult>> DeleteAsync(Guid id)
	{
		var user = await GetApplicationUserAsync(id);
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		await fileService.DeleteAsync(user.AvatarUrl);
		user.AvatarUrl = null;

		return await userManager.UpdateAsync(user);
	}

	public async Task<Result<StreamFileContent>> GetAsync(Guid id)
	{
		var user = await GetApplicationUserAsync(id);

		var content = await fileService.ReadAsync(user.AvatarUrl);
		if (content is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var result = new StreamFileContent(content, MimeMapping.MimeUtility.GetMimeMapping(user.AvatarUrl));
		return result;
	}

	private async Task<ApplicationUser> GetApplicationUserAsync(Guid id) 
		=> await userManager.FindByIdAsync(id.ToString());
}