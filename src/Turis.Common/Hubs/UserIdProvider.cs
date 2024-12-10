using Microsoft.AspNetCore.SignalR;

namespace Turis.Common.Hubs;

public class UserIdProvider : IUserIdProvider
{
    public string GetUserId(HubConnectionContext connection)
    {
        return connection.User.FindFirst("UserName")?.Value;
    }
}