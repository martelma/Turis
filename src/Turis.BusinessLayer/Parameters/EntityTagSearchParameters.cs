using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class EntityTagSearchParameters : PaginationParameters
{
	[FromQuery]
	public string EntityName { get; set; }
	[FromQuery]
	public string EntityKey { get; set; }
}