using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class PaymentModel : BaseModel
{
	public DateTimeOffset Date { get; set; }
	public Guid? CollaboratorId { get; set; }
	public ContactModel Collaborator { get; set; }
	public decimal VatRate { get; set; }
	public decimal Vat { get; set; }
	public decimal WithholdingTaxRate { get; set; }
	public decimal WithholdingTax { get; set; }
	public decimal Amount { get; set; }
	public decimal Total { get; set; }
	public string Note { get; set; }

	public List<PaymentItemModel> Items { get; set; } = [];
}