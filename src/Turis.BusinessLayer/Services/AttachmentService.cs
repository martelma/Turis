using JeMa.Shared.AspNetCore.Extensions;
using JeMa.Shared.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OperationResults;
using System.IO.Compression;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.BusinessLayer.Settings;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class AttachmentService(ApplicationDbContext dbContext
	, ILogger<AttachmentService> logger
	, IOptions<CdnSettings> cdnOptions
	, IUserService userService
	, IAuthService authService
	) : BaseService, IAttachmentService
{
	private readonly DbSet<Attachment> context = dbContext.Attachments;
	private readonly CdnSettings cdnSettings = cdnOptions.Value;

	IQueryable<Attachment> Query()
	{
		return context;
	}

	public async Task<Result<AttachmentModel>> GetAsync(Guid id)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel(authService);
	}

	public async Task<Result<AttachmentModel>> GetAsync(string entityName, Guid entityKey)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.EntityName == entityName && x.EntityKey == entityKey);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel(authService);
	}

	public async Task<List<Attachment>> ListAsync(string entityName, Guid entityKey, string folder = null)
	{
		var list = Query()
			.Where(x => x.EntityName == entityName)
			.Where(x => x.EntityKey == entityKey)
			.WhereIf(folder.HasValue(), x => x.Folder == folder)
			?.ToList();

		return await Task.FromResult(list);
	}

	public async Task<List<Attachment>> ListAsync(string entityName, List<Guid> entityKeys, string folder = null)
	{
		var list = Query()
			.Where(x => x.EntityName == entityName)
			.Where(x => entityKeys.Contains(x.EntityKey))
			.WhereIf(folder.HasValue(), x => x.Folder == folder)
			?.ToList();

		return await Task.FromResult(list);
	}

	public async Task<Result<PaginatedList<AttachmentModel>>> ListAsync(AttachmentSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = context.AsNoTracking();

		if (parameters.EntityName.HasValue())
		{
			query = query.Where(x => x.EntityName == parameters.EntityName);
		}
		if (parameters.EntityKey.HasValue())
		{
			query = query.Where(x => x.EntityKey.ToString() == parameters.EntityKey);
		}
		if (parameters.Folder.HasValue())
		{
			query = query.Where(x => x.Folder == parameters.Folder);
		}
		if (parameters.Type.HasValue())
		{
			query = query.Where(x => x.Type == parameters.Type);
		}

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					(x.Note != null && x.Note.Contains(itemPattern)));
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(Attachment.TimeStamp)}Asc":
					{
						query = query.OrderBy(x => x.TimeStamp);
						break;
					}
				case $"{nameof(Attachment.TimeStamp)}Desc":
					{
						query = query.OrderByDescending(x => x.TimeStamp);
						break;
					}
				case $"{nameof(Attachment.OriginalFileName)}Asc":
					{
						query = query.OrderBy(x => x.OriginalFileName);
						break;
					}
				case $"{nameof(Attachment.OriginalFileName)}Desc":
					{
						query = query.OrderByDescending(x => x.OriginalFileName);
						break;
					}
				case $"{nameof(Attachment.Type)}Asc":
					{
						query = query.OrderBy(x => x.Type);
						break;
					}
				case $"{nameof(Attachment.Type)}Desc":
					{
						query = query.OrderByDescending(x => x.Type);
						break;
					}
			}
		}
		else
			query = query.OrderBy(x => x.Folder).ThenBy(x => x.OriginalFileName);

		var list = await query
			.Skip(paginator.PageIndex * paginator.PageSize)
			.Take(paginator.PageSize)
			.Select(x => x.ToModel(authService))
			.ToListAsync();

		var result = new PaginatedList<AttachmentModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

		return await Task.FromResult(result);
	}

	public async Task<Attachment> SaveAsync(AttachmentRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new Attachment
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.EntityName = model.EntityName;
		record.EntityKey = model.EntityKey;
		record.UserId = model.UserId;
		record.TimeStamp = DateTime.Now;
		record.Folder = model.Folder;
		record.OriginalFileName = model.OriginalFileName;
		record.Type = model.Type;
		record.Note = model.Note;


		await dbContext.SaveChangesAsync();
		return record;
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}

	public Task<Result> DeleteAllAsync(string entityName, Guid entityKey, string folder)
	{
		throw new NotImplementedException();
	}

	public async Task<Result> Upload(IFormFileCollection files, string entityName, string entityKey, string folder)
	{
		foreach (var (file, i) in files.WithIndex())
		{
			var result = await SaveAsync(new AttachmentRequest
			{
				UserId = userService.GetUserId(),
				EntityKey = entityKey.ToGuid(),
				EntityName = entityName,
				Folder = folder,
				OriginalFileName = file.FileName,
				Type = file.GetFileExtension(),
			});

			var path = Path.Combine(cdnSettings.Root, cdnSettings.AttachmentFolder, entityName, entityKey);
			if (folder.HasValue())
				path = Path.Combine(path, folder);

			if (!Directory.Exists(path))
				Directory.CreateDirectory(path);

			var fullFileName = Path.Combine(path, $"{result.Id}-{result.OriginalFileName}");
			await using var fileStream = new FileStream(fullFileName, FileMode.Create);
			await file.CopyToAsync(fileStream);
		}
		return Result.Ok();
	}

	public async Task<Result<StreamFileContent>> DownloadAsync(Guid attachmentId)
	{
		var record = await dbContext.Attachments.FindAsync(attachmentId);
		if (record == null)
			return Result.Fail(FailureReasons.ItemNotFound);

		var fullPath = await GetFullPathAsync(record);
		await using var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);

		return await PrepareStreamFileContent(fileStream, record.OriginalFileName);
	}

	public async Task<Result<StreamFileContent>> DownloadAllAsync(string entityName, Guid entityKey, string folder)
	{
		var records = await ListAsync(entityName, entityKey, folder);
		if (records == null)
			return Result.Fail(FailureReasons.ItemNotFound);

		byte[] bytes = null;
		using (var zipStream = new MemoryStream())
		{
			using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
			{
				foreach (var item in records)
				{
					var fullPath = await GetFullPathAsync(item);
					await using var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
					var entry = zip.CreateEntry($"{folder}/{item.OriginalFileName}", CompressionLevel.Fastest);
					await using var entryStream = entry.Open();
					await fileStream.CopyToAsync(entryStream);
				}
			}

			zipStream.Position = 0;
			bytes = zipStream.ToArray();
		}

		var zipFile = new MemoryStream(bytes);

		return await PrepareStreamFileContent(zipFile, $"{folder}.zip");
	}

	public Task<string> GetFullPathAsync(Attachment attachment)
	{
		var path = Path.Combine(cdnSettings.Root, cdnSettings.AttachmentFolder, attachment.EntityName, attachment.EntityKey.ToString());
		if (attachment.Folder.HasValue())
			path = Path.Combine(path, attachment.Folder);

		var fullFileName = Path.Combine(path, $"{attachment.Id}-{attachment.OriginalFileName}");

		return Task.FromResult(fullFileName);
	}
}