using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class PaymentItem : BaseEntity
{
	public Guid PaymentId { get; set; }
	public Payment Payment { get; set; }
	public Guid ServiceId { get; set; }
	public Service Service { get; set; }
}