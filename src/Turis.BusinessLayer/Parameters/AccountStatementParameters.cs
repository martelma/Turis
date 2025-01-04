using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class AccountStatementParameters : BaseSearchParameters
{
	[FromQuery]
	public Guid ContactId { get; set; }
	[FromQuery]
	public string DateFrom { get; set; }
	[FromQuery]
	public string DateTo { get; set; }
	[FromQuery]
	public string ServiceType { get; set; }
	[FromQuery]
	public string DurationType { get; set; }
}