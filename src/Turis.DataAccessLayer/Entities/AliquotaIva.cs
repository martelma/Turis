using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class AliquotaIva : BaseEntity, ITemplate
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string Description { get; set; }
	public decimal Aliquota { get; set; }
	public string CodiceNatura { get; set; }
}