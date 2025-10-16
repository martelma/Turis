using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class TeamSummaryParameters : BaseSearchParameters
{
	[FromQuery]
	public int Year{ get; set; }
	[FromQuery]
	public string Pattern { get; set; }
}