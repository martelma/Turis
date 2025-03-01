using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class Tag : BaseEntity, ITemplate
{
	public string Name { get; set; }
	public string Description{ get; set; }
	public string Color { get; set; }
}