using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class CalendarInfo : BaseModel
{
	public DateTimeOffset Date { get; set; }
	public int Count { get; set; }
}