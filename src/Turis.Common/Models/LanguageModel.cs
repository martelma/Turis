using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class LanguageModel : BaseModel
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string CodeIso { get; set; }
}