using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class TeamSummaryParameters : PaginationParameters
{
	[FromQuery]
	public int Year{ get; set; }
	[FromQuery]
	public string Pattern { get; set; }
}