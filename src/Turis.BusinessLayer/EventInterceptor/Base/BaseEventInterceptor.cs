using JeMa.Shared.Extensions;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Hubs;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.EventInterceptor.Base;

public class BaseEventInterceptor
{
	public IUserService UserService { get; }
    protected readonly IHubContext<NotificationHub, INotificationHub> NotificationHubContext;

    public BaseEventInterceptor(
        IUserService userService,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext)
    {
	    UserService = userService;
        NotificationHubContext = notificationHubContext;
    }

    /// <summary>
    /// Save event into write model and update projection
    /// </summary>
    /// <param name="boxEvent"></param>
    protected void SaveEventLog(IApplicationEvent boxEvent)
    {
        var eventLog = new EventLog
        {
            UserId = UserService.GetUserId(),
            TimeStampe = DateTime.Now,
            EntityName = boxEvent.EntityName,
            EntityId = boxEvent.EntityId.ToGuid(),
            EventName = boxEvent.EventName,
            AdditionalInfo = boxEvent.AdditionalInfo
        };

        SaveEventLog(eventLog);
    }

    protected void SaveEventLog(EventLog eventLog)
    {
        //AddEventToProjection(eventLog);
    }

    //protected void AddEventToProjection(EventLog eventLog)
    //{
    //    new EventLogProjection().Add(eventLog);
    //}
}