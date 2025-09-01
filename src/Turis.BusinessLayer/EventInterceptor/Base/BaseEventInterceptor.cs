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
    /// <param name="applicationEvent"></param>
    protected void SaveEventLog(IApplicationEvent applicationEvent)
    {
        var eventLog = new EventLog
        {
            UserId = UserService.GetUserId(),
            TimeStamp = DateTime.Now,
            EntityName = applicationEvent.EntityName,
            EntityKey = applicationEvent.EntityKey,
            EventName = applicationEvent.EventName,
            AdditionalInfo = applicationEvent.AdditionalInfo
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