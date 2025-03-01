using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class TagRequest : BaseRequest
{
	public string Name { get; set; }
	public string Description { get; set; }
	public string Color { get; set; }
}