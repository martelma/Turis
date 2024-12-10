using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class Bookmark : BaseEntity
{
    public Guid UserId { get; set; }

    public string EntityName { get; set; }

    public Guid EntityId { get; set; }

    public DateTime Date { get; set; }
}
