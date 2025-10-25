using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class PaymentItemModel : BaseModel
{
	public Guid PaymentId { get; set; }
	//public PaymentModel Payment { get; set; }
	public Guid ServiceId { get; set; }
	public ServiceInfoModel Service { get; set; }
}