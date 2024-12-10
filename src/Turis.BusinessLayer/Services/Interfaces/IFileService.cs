using NPOI.XSSF.UserModel;
using Turis.BusinessLayer.Services.Base;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IFileService : IService
{
	async Task SaveAsync(string relativePath, byte[] file)
	{
		using var stream = new MemoryStream(file);
		await SaveAsync(relativePath, stream);
	}

	Task SaveAsync(string relativePath, Stream stream);

	Task DeleteAsync(string relativePath);

	Task<Stream> ReadAsync(string relativePath);

	Task ClearCdnTempAsync();

	Task SaveCdnTempAsync(XSSFWorkbook workbook, string fileName);

	Task<Stream> ReadCdnTempAsync(string fileName);
}