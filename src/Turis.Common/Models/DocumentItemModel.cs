using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class DocumentItemModel : BaseModel
{
	public Guid? DocumentId { get; set; }
	public DocumentInfoModel Document { get; set; }
	public Guid? ServiceId { get; set; }
	public ServiceInfoModel Service { get; set; }
	public int Row { get; set; }
	public string Code { get; set; }
	public string Description { get; set; }
	public string CodiceNatura { get; set; }
	public string RiferimentoNormativo { get; set; }
	public decimal Quantity { get; set; }
	public decimal Price { get; set; }
	public decimal DiscountPercentage { get; set; }

	public decimal RowAmount
	{
		get
		{
			var amount = Quantity * Price;
			var discount = amount * DiscountPercentage / 100;

			return amount - discount;
		}
	}

	public string CodiceEsigibilitaIVA { get; set; }
	public decimal VatRate { get; set; }

	public decimal Vat => RowAmount * VatRate / 100;
}