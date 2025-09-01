using Turis.Authentication.Entities;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class EventLog : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; }
    public DateTimeOffset TimeStamp { get; set; }
    public string EntityName { get; set; }
    public string EntityKey { get; set; }
    public string EventName { get; set; }
    public string AdditionalInfo { get; set; }
}