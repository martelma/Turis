using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class PaymentTypeModel : BaseModel
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string Note{ get; set; }
	public string SdiCode { get; set; }
	public string SdiName{ get; set; }
}