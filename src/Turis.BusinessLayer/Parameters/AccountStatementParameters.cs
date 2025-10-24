using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class AccountStatementParameters : PaginationParameters
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