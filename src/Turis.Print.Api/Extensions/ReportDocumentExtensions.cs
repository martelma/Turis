using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

namespace MiBox.Print.Api.Extensions
{
	public static class ReportDocumentExtensions
	{
		public static byte[] ToByteArray(this ReportDocument reportDocument)
		{
			using (var ms = new MemoryStream())
			{
				using (var stream = reportDocument.ExportToStream(ExportFormatType.PortableDocFormat))
				{
					stream.CopyTo(ms);
				}
				return ms.ToArray();
			}
		}
	}
}