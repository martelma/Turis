using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class EventLogModel : BaseModel
{
	public DateTimeOffset TimeStampe { get; set; }
	public string EntityName { get; set; }
	public string EntityKey { get; set; }
	public string EventName { get; set; }
	public string AdditionalInfo { get; set; }
	public UserModel User { get; set; }
}