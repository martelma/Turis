using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class AliquotaIvaSearchParameters: PaginationParameters
{
	[FromQuery]
	public string Pattern { get; set; }
}