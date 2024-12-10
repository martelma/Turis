using Turis.Authentication.Entities;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class PrimaNota : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; }
    public DateTime TSInserimento { get; set; }
    public DateTime Data { get; set; }
    public string Descrizione { get; set; }
    public decimal Entrata { get; set; }
    public decimal Uscita { get; set; }
}