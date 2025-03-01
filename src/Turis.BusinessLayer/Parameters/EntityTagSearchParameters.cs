using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class EntityTagSearchParameters : BaseSearchParameters
{
	[FromQuery]
	public string EntityName { get; set; }
	[FromQuery]
	public string EntityKey { get; set; }
}