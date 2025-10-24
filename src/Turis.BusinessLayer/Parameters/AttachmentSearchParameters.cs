using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class AttachmentSearchParameters : PaginationParameters
{
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string EntityName { get; set; }
	[FromQuery]
	public string EntityKey { get; set; }
	[FromQuery]
	public string Folder { get; set; }
	[FromQuery]
	public string Type { get; set; }
}