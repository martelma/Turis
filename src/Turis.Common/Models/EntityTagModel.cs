using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class EntityTagModel : BaseModel
{
	public string EntityName { get; set; }
	public Guid EntityKey { get; set; }
	public Guid UserId { get; set; }
	public UserModel User { get; set; }
	public DateTimeOffset TimeStamp { get; set; }
	public Guid TagId { get; set; }
	public TagModel Tag { get; set; }
}