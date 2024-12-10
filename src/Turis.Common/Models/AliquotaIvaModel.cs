using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class AliquotaIvaModel : BaseModel
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string Description { get; set; }
	public decimal Aliquota { get; set; }
	public string CodiceNatura { get; set; }
}