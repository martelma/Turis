using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class EventLogExtensions
{
    public static EventLogModel ToModel(this EventLog item)
    {
        var model = new EventLogModel
		{
            Id = item.Id,
            User = item.User.ToModel(),
            TimeStampe = item.TimeStamp,
            EntityName = item.EntityName,
            EntityKey = item.EntityKey,
            EventName = item.EventName,
            AdditionalInfo = item.AdditionalInfo,
        };

        return model;
    }

    public static IEnumerable<EventLogModel> ToModel(this IEnumerable<EventLog> items)
    {
        return items.Select(x => x.ToModel());
    }
}