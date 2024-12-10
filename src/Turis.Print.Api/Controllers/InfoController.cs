using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using MiBox.Print.Api.Models;

namespace MiBox.Print.Api.Controllers
{
    [Route("api/Info")]
    public class InfoController : ApiController
    {
        [HttpPost]
        [Route("api/Info/Labels")]
        public HttpResponseMessage Labels(IEnumerable<Label> list)
        {
            var reportPath = "~/Info/Labels";
            var reportFileName = "Label.rpt";

            var bytes = CrystalReport.RenderReport(reportPath, reportFileName, list);

            //System.IO.File.WriteAllBytes(@"c:\temp\test.pdf",bytes);
            //var mimeType = "application/pdf";
            //var fileName = "Test.pdf";

            var response = Request.CreateResponse();
            response.Content = new StreamContent(new MemoryStream(bytes));
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            response.Content.Headers.ContentLength = bytes.Length;

            return response;
        }
		
        [HttpPost]
        [Route("api/Info/Cart")]
        public HttpResponseMessage Cart(Cart cart)
        {
            var reportPath = "~/Info/Cart";
            //var reportFileName = "TestCart.rpt";
            //var reportFileName = "CartItemsHM.rpt";
            var reportFileName = "CartItems.rpt";

            var bytes = CrystalReport.RenderReport(reportPath, reportFileName, cart);

            //System.IO.File.WriteAllBytes(@"c:\temp\test.pdf",bytes);
            //var mimeType = "application/pdf";
            //var fileName = "Test.pdf";

            var response = Request.CreateResponse();
            response.Content = new StreamContent(new MemoryStream(bytes));
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            response.Content.Headers.ContentLength = bytes.Length;

            return response;
        }
    }
}