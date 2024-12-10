using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class Audit : BaseEntity
{
    public Guid UserId { get; set; }
    public string Action { get; set; }
    public DateTime Date { get; set; }
    public string EntityName { get; set; }
    public string EntityKey { get; set; }
    public string Values { get; set; }
}
