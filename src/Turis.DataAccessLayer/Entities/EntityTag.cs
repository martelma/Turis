using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class EntityTag : BaseEntity
{
	public string EntityName { get; set; }
	public Guid EntityKey { get; set; }
	public Guid UserId { get; set; }
	public DateTimeOffset TimeStamp { get; set; }
	public Guid TagId { get; set; }
	public Tag Tag { get; set; }
}