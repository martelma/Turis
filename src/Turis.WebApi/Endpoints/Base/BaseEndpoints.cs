using Microsoft.AspNetCore.Http.HttpResults;
using NPOI.SS.UserModel;
using NPOI.Util;

namespace Turis.WebApi.Endpoints.Base;

public class BaseEndpoints
{
    protected static FileContentHttpResult DownloadBlob(IWorkbook workbook, string fileName)
    {
        var bos = new ByteArrayOutputStream();
        try
        {
            workbook.Write(bos, true);
        }
        finally
        {
            bos.Close();
        }

        var bytes = bos.ToByteArray();

        var mimeType = MimeMapping.MimeUtility.GetMimeMapping(fileName);

        return TypedResults.File(bytes, mimeType, fileName);
    }
}