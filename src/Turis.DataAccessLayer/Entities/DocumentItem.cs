using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class DocumentItem : BaseEntity
{
	public Guid DocumentId { get; set; }
	public Document Document{ get; set; }
	public Guid? ServiceId { get; set; }
	public Service Service { get; set; }
	public int Row { get; set; }
	public string Code { get; set; }
	public string Description { get; set; }
	public string CodiceNatura { get; set; }
	public string RiferimentoNormativo { get; set; }
	public string CodiceEsigibilitaIVA { get; set; }
	public decimal Quantity { get; set; }
	public decimal Price { get; set; }
	public decimal DiscountPercentage { get; set; }
	public decimal VatRate { get; set; }
}