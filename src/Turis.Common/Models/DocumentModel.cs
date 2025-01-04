using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class DocumentModel : BaseModel
{
	public Guid? DocumentRefId { get; set; }
	public DocumentModel DocumentRef { get; set; }
	public string Type { get; set; }
	public string Status { get; set; }
	public Guid? ClientId { get; set; }
	public ContactModel Client { get; set; }
	public string IdSdi { get; set; }
	public DateTimeOffset Date { get; set; }
	public string Sectional { get; set; }
	public int Number { get; set; }
	public decimal DiscountPercentage { get; set; }
	public decimal Discount { get; set; }
	public decimal Amount { get; set; }
	public decimal VatRate { get; set; }
	public decimal Vat { get; set; }
	public decimal AliquotaRitenutaDiAcconto { get; set; }
	public decimal RitenutaDiAcconto { get; set; }
	public decimal TotalExemptExpenses { get; set; }
	public decimal TotalExpenses { get; set; }
	public decimal Total { get; set; }
	public decimal ImportoBollo { get; set; }
	public string DesTipoPagamento { get; set; }
	public bool Saldato { get; set; }
	public DateTimeOffset? DataIncasso { get; set; }
	public Guid? CollaboratorId { get; set; }
	public ContactModel Collaborator { get; set; }
	public string SdiCodiceTipoPagamento { get; set; }
	public string SdiValoreTipoPagamento { get; set; }
	public string SdiCodiceCondizionePagamento { get; set; }
	public DateTimeOffset? DataScadenzaPagamento { get; set; }
	public string Cig { get; set; }
	public string Cup { get; set; }
	public string XmlFileName => $"{Sectional}-{Number.ToString().PadLeft(8, '0')}.xml";
}