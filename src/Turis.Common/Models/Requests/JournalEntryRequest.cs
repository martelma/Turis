using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class JournalEntryRequest : BaseRequest
{
	public DateTimeOffset Date { get; set; }
	public string Description { get; set; }
	public string Note { get; set; }
	public decimal Amount { get; set; }
	public List<TagRequest> Tags { get; set; } = [];
}