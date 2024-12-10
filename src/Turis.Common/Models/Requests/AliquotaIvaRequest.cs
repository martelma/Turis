using Turis.Common.Models.Base;

namespace Turis.Common.Models.Requests;

public class AliquotaIvaRequest : BaseRequest
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string Description { get; set; }
	public decimal Aliquota { get; set; }
	public string CodiceNatura { get; set; }
}