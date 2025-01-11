using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class AttachmentSearchParameters: BaseSearchParameters
{
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string EntityName { get; set; }
	[FromQuery]
	public string EntityKey { get; set; }
	[FromQuery]
	public string Folder{ get; set; }
	[FromQuery]
	public string Type{ get; set; }
}