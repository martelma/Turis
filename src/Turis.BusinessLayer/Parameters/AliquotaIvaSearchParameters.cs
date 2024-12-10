using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class AliquotaIvaSearchParameters: BaseSearchParameters
{
	[FromQuery]
	public string Pattern { get; set; }
}