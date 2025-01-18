using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class JournalEntry : BaseEntity
{
	public Guid UserId { get; set; }
	public DateTimeOffset TimeStamp { get; set; }
	public DateTimeOffset Date { get; set; }
	public decimal Amount { get; set; }
	public string Description { get; set; }
}