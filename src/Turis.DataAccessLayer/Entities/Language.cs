using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class Language : BaseEntity, ITemplate
{
	public string Code { get; set; }
	public string Name { get; set; }
	public string CodeIso { get; set; }
}