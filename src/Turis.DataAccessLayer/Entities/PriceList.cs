using Turis.Common.Enums;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class PriceList : BaseEntity, ITemplate
{
	public string Code { get; set; }
	public string Name { get; set; }
	public ServiceType ServiceType { get; set; }
	public DurationType DurationType { get; set; }
	public int MaxCount { get; set; }
	public decimal Price { get; set; }
	public decimal PriceExtra { get; set; }
}