using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class JournalEntryModel : BaseModel
{
	public Guid UserId { get; set; }
	public DateTimeOffset TimeStamp { get; set; }
	public DateTimeOffset Date { get; set; }
	public string Description { get; set; }
	public decimal Amount { get; set; }
	public string BookmarkId { get; set; }
}