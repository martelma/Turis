using JeMa.Shared.Extensions;
using Microsoft.AspNetCore.SignalR;

namespace Turis.Common.Hubs;

public class NotificationHubService(
    IHubContext<NotificationHub, INotificationHub> notificationHubContext,
    NotificationHubManager notificationHubManager) : INotificationHubService
{
    private INotificationHub GetNotificationHub(List<string> connectionIds)
    {
        return notificationHubContext.Clients.Clients(connectionIds);
    }

    public INotificationHub ToAll()
    {
        var connectionIds = notificationHubManager.GetConnections()
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        return GetNotificationHub(connectionIds);
    }

    public async Task ToAdminsAsync(ProgressInfo progressInfo)
    {
        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.GroupName == NotificationHub.AdminUsers)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).Progress(progressInfo);
    }

    public async Task ToUserAsync(ProgressInfo progressInfo)
    {
        if (progressInfo.UserName.IsNullOrEmpty())
            return;

        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.UserName == progressInfo.UserName)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).Progress(progressInfo);
    }

    #region ToUserAndAdmins

    public async Task ToUserAndAdminsAsync(ProgressInfo progressInfo)
    {
        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.UserName == progressInfo.UserName || x.GroupName == NotificationHub.AdminUsers)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).Progress(progressInfo);
    }

    public async Task ToUserAndAdminsAsync(TaskCompletedMessage taskCompletedMessage)
    {
        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.UserName == taskCompletedMessage.UserName|| x.GroupName == NotificationHub.AdminUsers)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).TaskCompleted(taskCompletedMessage);
    }

    public async Task ToUserAndAdminsAsync(Message message)
    {
        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.UserName == message.UserName || x.GroupName == NotificationHub.AdminUsers)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).Message(message);
    }

    #endregion

    #region ToAll

    public async Task ToAllAsync(ProgressInfo progressInfo)
    {
        if (progressInfo.UserName.IsNullOrEmpty())
            return;

        var connectionIds = notificationHubManager.GetConnections()
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).Progress(progressInfo);
    }

    public async Task ToAllAsync(TaskCompletedMessage taskCompletedMessage)
    {
        if (taskCompletedMessage.UserName.IsNullOrEmpty())
            return;

        var connectionIds = notificationHubManager.Connections
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).TaskCompleted(taskCompletedMessage);
    }

    #endregion

    #region ToGroup

    public async Task ToGroupAsync(string groupName, ProgressInfo progressInfo)
    {
        if (groupName.IsNullOrEmpty())
            return;

        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.GroupName == groupName)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        await GetNotificationHub(connectionIds).Progress(progressInfo);
    }

    public INotificationHub ToGroup(string groupName)
    {
        if (groupName.IsNullOrEmpty())
            return null;

        var connectionIds = notificationHubManager.GetConnections()
            .Where(x => x.GroupName == groupName)
            .Select(x => x.ConnectionId)
            .Distinct()
            .ToList();

        return GetNotificationHub(connectionIds);
    }

	#endregion

	//public Task AcceptProposal(Guid serviceId)
	//{
	//	throw new NotImplementedException();
	//}

	//public Task RejectProposal(Guid serviceId)
	//{
	//	throw new NotImplementedException();
	//}
}