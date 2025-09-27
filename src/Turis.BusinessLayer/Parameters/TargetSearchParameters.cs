using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class TargetSearchParameters : BaseSearchParameters
{
	[FromQuery]
	public Guid CollaboratorId { get; set; }
	[FromQuery]
	public int Year { get; set; }
	[FromQuery]
	public int Month { get; set; }
}