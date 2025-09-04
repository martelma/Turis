namespace Turis.Common.Hubs;

public class NotificationHubManager
{
	public HashSet<ConnectionNotificationData> Connections { get; } = [];

    public List<ConnectionNotificationData> GetConnections()
    {
        return Connections.Where(x => x is not null).ToList();
    }
}