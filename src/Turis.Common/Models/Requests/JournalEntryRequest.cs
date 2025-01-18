using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class JournalEntryRequest : BaseRequest
{
	//public Guid UserId { get; set; }
	//public DateTimeOffset TimeStamp { get; set; }
	public DateTimeOffset Date { get; set; }
	public string Description { get; set; }
	public decimal Income { get; set; }
	public decimal Expense { get; set; }
}