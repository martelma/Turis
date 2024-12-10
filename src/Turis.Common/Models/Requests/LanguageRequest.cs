using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class LanguageRequest : BaseRequest
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string CodeIso { get; set; }
}