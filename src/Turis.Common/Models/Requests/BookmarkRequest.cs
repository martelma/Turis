using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class BookmarkRequest : BaseModel
{
	public string EntityName { get; set; }
	public string EntityId { get; set; }
}