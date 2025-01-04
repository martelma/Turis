using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class AttachmentModel : BaseModel
{
	public string EntityName { get; set; }
	public Guid EntityKey { get; set; }
	public Guid UserId { get; set; }
	public UserModel User { get; set; }
	public DateTime TimeStamp { get; set; }
	public string Folder { get; set; }
	public string OriginalFileName { get; set; }
	public string Type { get; set; }
	public string Note { get; set; }
}