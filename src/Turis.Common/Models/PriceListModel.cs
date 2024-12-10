using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class PriceListModel : BaseModel
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string ServiceType { get; set; }
	public string DurationType { get; set; }
	public int MaxCount { get; set; }
	public decimal Price { get; set; }
	public decimal PriceExtra { get; set; }
}