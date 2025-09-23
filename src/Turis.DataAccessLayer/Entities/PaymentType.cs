using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class PaymentType : BaseEntity
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string Note { get; set; }
	public string SdiCode { get; set; }
	public string SdiName { get; set; }
}