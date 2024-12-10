using JeMa.Shared.Extensions;
using Microsoft.Extensions.Options;
using NPOI.XSSF.UserModel;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.BusinessLayer.Services;

public class FileService(IOptions<CdnSettings> cdnSettings) : IFileService
{
	private readonly CdnSettings cdnSettings = cdnSettings.Value;

	public async Task SaveAsync(string relativePath, Stream stream)
	{
		var fullPath = GetFullPath(relativePath);
		var directory = Path.GetDirectoryName(fullPath);
		if (!Directory.Exists(directory))
		{
			Directory.CreateDirectory(directory);
		}

		await using var fs = File.OpenWrite(fullPath);
		await stream.CopyToAsync(fs);
	}

	public Task DeleteAsync(string relativePath)
	{
		if (relativePath.IsNullOrEmpty())
			return Task.CompletedTask;

		try
		{
			var fullPath = GetFullPath(relativePath);
			if (File.Exists(fullPath))
			{
				File.Delete(fullPath);
			}
		}
		catch
		{
		}

		return Task.CompletedTask;
	}

	public async Task<Stream> ReadAsync(string relativePath)
	{
		if (relativePath.IsNullOrEmpty())
		{
			return null;
		}

		var path = GetFullPath(relativePath);

		if (File.Exists(path))
		{
			var ms = new MemoryStream();
			using var file = File.OpenRead(path);
			await file.CopyToAsync(ms);

			return ms;
		}

		return null;
	}

	public Task ClearCdnTempAsync()
	{
		var files = Directory.GetFiles(GetFullTempRoot());

		foreach (var file in files)
		{
			var fi = new FileInfo(file);
			if (fi.LastAccessTime < DateTime.UtcNow.AddMinutes(-cdnSettings.MinutesExpiration))
			{
				fi.Delete();
			}
		}

		return Task.CompletedTask;
	}

	public Task SaveCdnTempAsync(XSSFWorkbook workbook, string fileName)
	{
		using var bos = File.OpenWrite(GetFullTempPath(fileName));

		try
		{
			workbook.Write(bos, true);
		}
		finally
		{
			bos.Close();
		}

		return Task.CompletedTask;
	}

	public Task<Stream> ReadCdnTempAsync(string fileName)
	{
		var relativePath = Path.Combine(cdnSettings.TempFolder, fileName);
		return ReadAsync(relativePath);
	}

	private string GetFullPath(string relativePath) => Path.Combine(cdnSettings.Root, relativePath);

	private string GetFullTempRoot() => Path.Combine(cdnSettings.Root, cdnSettings.TempFolder);

	private string GetFullTempPath(string relativePath) => Path.Combine(GetFullTempRoot(), relativePath);
}
public class CdnSettings
{
	public string Root { get; set; }
	public string AvatarFolder { get; set; }
	public string TempFolder { get; set; }
	public int MinutesExpiration { get; set; }
}