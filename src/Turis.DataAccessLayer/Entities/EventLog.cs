using Turis.Authentication.Entities;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class EventLog : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; }
    public DateTimeOffset TimeStampe { get; set; }
    public Guid EntityId { get; set; }
    public string EntityName { get; set; }
    public string EventName { get; set; }
    public string AdditionalInfo { get; set; }
}