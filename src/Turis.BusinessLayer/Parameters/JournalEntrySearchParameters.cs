using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class JournalEntrySearchParameters: PaginationParameters
{
	[FromQuery]
	public bool OnlyBookmarks { get; set; } = false;
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string DateFrom { get; set; }
	[FromQuery]
	public string DateTo { get; set; }
	[FromQuery]
	public string Description { get; set; }
	[FromQuery]
	public string Note { get; set; }
}