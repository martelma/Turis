using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class LinkedServiceModel : BaseModel
{
	public IEnumerable<ServiceEasyModel> SourceServices { get; set; }
	public IEnumerable<ServiceEasyModel> TargetServices { get; set; }
}