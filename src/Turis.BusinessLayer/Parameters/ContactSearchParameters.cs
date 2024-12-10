using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class ContactSearchParameters : BaseSearchParameters
{
	[FromQuery]
	public bool OnlyBookmarks { get; set; } = false;
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string Code { get; set; }
	[FromQuery]
	public string FirstName { get; set; }
	[FromQuery]
	public string LastName { get; set; }
	[FromQuery]
	public string CompanyName { get; set; }
	[FromQuery]
	public string Note { get; set; }
}