using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class PaymentTypeRequest : BaseRequest
{
	public string Code{ get; set; }
	public string Name { get; set; }
	public string Note{ get; set; }
	public string SdiCode{ get; set; }
	public string SdiName { get; set; }
}