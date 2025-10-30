using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class CalendarInfoParameters
{
	[FromQuery]
	public Guid CollaboratorId{ get; set; }
	[FromQuery]
	public string DateFrom { get; set; }
	[FromQuery]
	public string DateTo { get; set; }
}