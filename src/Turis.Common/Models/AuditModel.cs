using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class AuditModel : BaseModel
{
	public Guid UserId { get; set; }
	public string Action { get; set; }
	public DateTime Date { get; set; }
	public string EntityName { get; set; }
	public string EntityKey { get; set; }
	public string Values { get; set; }
}