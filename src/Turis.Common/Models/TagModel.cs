using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class TagModel : BaseModel
{
	public string Name { get; set; }
	public string Description{ get; set; }
	public string Color { get; set; }
}