using NPOI.XSSF.UserModel;
using OperationResults;

namespace Turis.BusinessLayer.Services.Base;

public class BaseService : IService
{
	protected static Task<StreamFileContent> PrepareStreamFileContent(XSSFWorkbook workbook, string fileName)
	{
		var ms = new MemoryStream();
		workbook.Write(ms, true);
		ms.Position = 0;

		var mimeType = MimeMapping.MimeUtility.GetMimeMapping(fileName);
		var result = new StreamFileContent(ms, mimeType, fileName);

		return Task.FromResult(result);
	}
	protected static Task<StreamFileContent> PrepareStreamFileContent(Stream stream, string fileName)
	{
		var mimeType = MimeMapping.MimeUtility.GetMimeMapping(fileName);
		var result = new StreamFileContent(stream, mimeType, fileName);

		return Task.FromResult(result);
	}
}