using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class ProductionCenter : BaseEntity, ITemplate
{
    public string Code { get; set; }
    public string Name { get; set; }
}