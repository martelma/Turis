using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CrystalDecisions.CrystalReports.Engine;
using MiBox.Print.Api.Extensions;
using MiBox.Print.Api.Models;

namespace MiBox.Print.Api
{
	public class CrystalReport
	{
		public static byte[] RenderReport(string reportPath, string reportFileName, Cart cart)
		{
			using (var rd = PrepareReportDocument(reportPath, reportFileName))
			{
				//NB: per poter settare più di un oggetto di tipo .NET è necessario settare un datasource per ogni table!
				var list = new List<Cart>()
				{
					cart
				};
				rd.Database.Tables[0].SetDataSource(list);
				rd.Database.Tables[1].SetDataSource(cart.Details.ToList());

				return rd.ToByteArray();
			}
		}

		public static byte[] RenderReport(string reportPath, string reportFileName, IEnumerable<Label> labels)
		{
			using (var rd = PrepareReportDocument(reportPath, reportFileName))
			{
				var labelPrints = new List<LabelPrint>();
				foreach (var label in labels)
				{
					labelPrints.Add(new LabelPrint(label));
					foreach (var coprodotto in label.Coprodotti)
					{
						labelPrints.Add(new LabelPrint(label, coprodotto));
					}
				}
				rd.Database.Tables[0].SetDataSource(labelPrints);
				return rd.ToByteArray();
			}
		}

		static ReportDocument PrepareReportDocument(string reportPath, string reportFileName)
		{
			//var fullFileName = Path.Combine(GetPhisicalPath(reportPath), reportFileName);
			var baseReportPath = System.Configuration.ConfigurationManager.AppSettings["ReportPath"];
			var fullFileName = Path.Combine(baseReportPath, reportPath, reportFileName);
			if (!File.Exists(fullFileName))
				throw new Exception($"Report non trovato [{fullFileName}]");

			var rd = new ReportDocument();
			rd.Load(fullFileName);
			return rd;
		}

		static string GetPhisicalPath(string reportPath)
		{
			return System.Web.Hosting.HostingEnvironment.MapPath(reportPath);
		}
	}
}