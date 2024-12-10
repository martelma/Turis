using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class EventLogModel : BaseModel
{
	public DateTime TimeStampe { get; set; }
	public string EntityName { get; set; }
	public Guid EntityId { get; set; }
	public string EventName { get; set; }
	public string AdditionalInfo { get; set; }
	public UserModel User { get; set; }
}