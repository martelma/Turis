using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer;

namespace Turis.BusinessLayer.Services;

public class AvatarContactService(ApplicationDbContext dbContext
	, IOptions<CdnSettings> cdnSettings
	, IFileService fileService
	, UserManager<ApplicationUser> userManager) : IAvatarContactService
{
	private readonly CdnSettings cdnSettings = cdnSettings.Value;

	public async Task<Result> SaveAsync(Guid id, Stream stream, string fileName)
	{
		var contact = dbContext.Contacts.FirstOrDefault(x => x.Id == id);
		if (contact is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var extension = Path.GetExtension(fileName);
		var relativePath = Path.Combine(cdnSettings.AvatarFolder, $"{id}{extension}");

		await fileService.SaveAsync(relativePath, stream);
		contact.AvatarUrl = relativePath;

		await dbContext.SaveAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		var contact = dbContext.Contacts.FirstOrDefault(x => x.Id == id);
		if (contact is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		await fileService.DeleteAsync(contact.AvatarUrl);
		contact.AvatarUrl = null;

		await dbContext.SaveAsync();
		return Result.Ok();
	}

	public async Task<Result<StreamFileContent>> GetAsync(Guid id)
	{
		var contact = dbContext.Contacts.FirstOrDefault(x => x.Id == id);
		if (contact is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var content = await fileService.ReadAsync(contact.AvatarUrl);
		if (content is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var result = new StreamFileContent(content, MimeMapping.MimeUtility.GetMimeMapping(contact.AvatarUrl));
		return result;
	}
}