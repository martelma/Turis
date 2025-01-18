using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class JournalEntrySearchParameters: BaseSearchParameters
{
	[FromQuery]
	public bool OnlyBookmarks { get; set; } = false;
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string DateFrom { get; set; }
	[FromQuery]
	public string DateTo { get; set; }
}