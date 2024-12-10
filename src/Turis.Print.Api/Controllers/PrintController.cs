using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Web.Http;
using MiBox.Print.Api.Models;
using MediaTypeHeaderValue = System.Net.Http.Headers.MediaTypeHeaderValue;

namespace MiBox.Print.Api.Controllers
{
	[Route("api/Print")]
	public class PrintController : ApiController
	{
		[HttpPost]
		[Route("api/Print/Labels")]
		public HttpResponseMessage Labels(IEnumerable<Label> list)
        {
            var bytes = CrystalReport.RenderReport("Labels", "Label.rpt", list);
            //SavePdfTest(bytes, @"c:\temp\test.pdf");
            return ReportResponse(bytes);
        }

        [HttpPost]
		[Route("api/Print/Cart")]
		public HttpResponseMessage Cart(Cart cart)
		{
            var bytes = CrystalReport.RenderReport("Carts", "Cart.rpt", cart);
            //SavePdfTest(bytes, @"c:\temp\test.pdf");
            return ReportResponse(bytes);
		}

        HttpResponseMessage ReportResponse(byte[] bytes)
        {
            var response = Request.CreateResponse();
            response.Content = new ByteArrayContent(bytes);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            response.Content.Headers.ContentLength = bytes.Length;

            return response;
        }

        static void SavePdfTest(byte[] bytes, string fullFileName)
        {
            File.WriteAllBytes(fullFileName, bytes);
            var mimeType = "application/pdf";
            var fileName = "Test.pdf";
        }
    }
}
