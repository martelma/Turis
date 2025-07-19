using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class ServiceSearchParameters : BaseSearchParameters
{
	[FromQuery]
	public bool OnlyBookmarks { get; set; } = false;
	[FromQuery]
	public string DateFrom { get; set; }
	[FromQuery]
	public string DateTo { get; set; }
	[FromQuery]
	public string Pattern { get; set; }
	[FromQuery]
	public string Code { get; set; }
	[FromQuery]
	public string Title { get; set; }
	[FromQuery]
	public string Note { get; set; }
	[FromQuery]
	public string ServiceType { get; set; }
	[FromQuery]
	public string DurationType { get; set; }
	[FromQuery]
	public string[] Languages { get; set; }
	[FromQuery]
	public string Status { get; set; }
	[FromQuery]
	public string[] Statuses { get; set; }
	[FromQuery]
	public string WorkflowCollaboratorStatus { get; set; }
}