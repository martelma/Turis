namespace Turis.Common.Hubs;

public class ConnectionNotificationData : IEquatable<ConnectionNotificationData>
{
    public string ConnectionId { get; set; }
    public string UserName { get; set; }
    public string GroupName { get; set; }
    public DateTime Start { get; set; }

    public bool Equals(ConnectionNotificationData other)
    {
        if (ReferenceEquals(null, other))
        {
            return false;
        }

        if (ReferenceEquals(this, other))
        {
            return true;
        }

        return ConnectionId == other.ConnectionId && UserName == other.UserName && GroupName == other.GroupName;
    }

    public override bool Equals(object obj)
    {
        if (ReferenceEquals(null, obj))
        {
            return false;
        }

        if (ReferenceEquals(this, obj))
        {
            return true;
        }

        if (obj.GetType() != this.GetType())
        {
            return false;
        }

        return Equals((ConnectionNotificationData)obj);
    }

    public override int GetHashCode() => HashCode.Combine(ConnectionId, UserName, GroupName);

    public static bool operator ==(ConnectionNotificationData x, ConnectionNotificationData y)
        => ReferenceEquals(x, y) || (x?.Equals(y) ?? false);

    public static bool operator !=(ConnectionNotificationData x, ConnectionNotificationData y) => !(x == y);
}