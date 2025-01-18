using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class Attachment : BaseEntity
{
	public string EntityName { get; set; }
	public Guid EntityKey { get; set; }
	public Guid UserId { get; set; }
	public DateTimeOffset TimeStamp { get; set; }
	public string Folder { get; set; }
	public string OriginalFileName { get; set; }
	public string Type { get; set; }
	public string Note { get; set; }
}