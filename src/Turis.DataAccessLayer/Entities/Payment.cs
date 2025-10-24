using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class Payment : BaseEntity
{
	public DateTimeOffset Date { get; set; }
	public Guid? CollaboratorId { get; set; }
	public Contact Collaborator { get; set; }
	public decimal VatRate { get; set; }
	public decimal Vat { get; set; }
	public decimal WithholdingTaxRate { get; set; }
	public decimal WithholdingTax { get; set; }
	public decimal Amount { get; set; }
	public decimal Total { get; set; }
	public string Note { get; set; }

	public virtual ICollection<PaymentItem> Items { get; set; } = new List<PaymentItem>();
}