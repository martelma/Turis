using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class Listino : BaseEntity, ITemplate
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string TipoServizio { get; set; }
    public string TipoDurata { get; set; }
    public int LimiteFascia1 { get; set; }
    public decimal PrezzoFascia1 { get; set; }
    public decimal PrezzoEccedenze { get; set; }
}