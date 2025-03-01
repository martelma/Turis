using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class EntityTagRequest : BaseRequest
{
	public string EntityName { get; set; }
	public Guid EntityKey { get; set; }
	public Guid TagId { get; set; }
}