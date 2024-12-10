using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class EventLogExtensions
{
    public static EventLogModel ToViewModel(this EventLog item)
    {
        var model = new EventLogModel
		{
            Id = item.Id,
            User = item.User.ToModel(),
            TimeStampe = item.TimeStampe,
            EntityName = item.EntityName,
            EntityId = item.EntityId,
            EventName = item.EventName,
            AdditionalInfo = item.AdditionalInfo,
        };

        return model;
    }

    public static IEnumerable<EventLogModel> ToViewModel(this IEnumerable<EventLog> items)
    {
        return items.Select(x => x.ToViewModel());
    }
}