using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class CalendarInfo : BaseModel
{
	public DateTimeOffset Date { get; set; }
	public int CountConfirmed { get; set; }
	public int CountPending { get; set; }
}