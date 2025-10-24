using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class TargetSearchParameters : PaginationParameters
{
	[FromQuery]
	public Guid? CollaboratorId { get; set; }
	[FromQuery]
	public int? Year { get; set; }
	[FromQuery]
	public int? Month { get; set; }
}