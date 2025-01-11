using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class DocumentSearchParameters: BaseSearchParameters
{
	[FromQuery]
	public bool OnlyBookmarks { get; set; } = false;
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string DocumentType { get; set; }
	[FromQuery]
	public string Sectional { get; set; }
	[FromQuery]
	public int NumberFrom { get; set; }
	[FromQuery]
	public int NumberTo { get; set; }
	[FromQuery]
	public string DateFrom { get; set; }
	[FromQuery]
	public string DateTo { get; set; }
}