using JeMa.Shared.Extensions;
using Microsoft.AspNetCore.SignalR;

namespace Turis.Common.Hubs;

public class NotificationHub : Hub<INotificationHub>
{
	public const string GroupAllUsers = "AllUsers";
	public const string AdminUsers = "AdminUsers";

	public override Task OnConnectedAsync()
    {
        if (!Context.UserIdentifier.IsNullOrEmpty())
        {
            Groups.AddToGroupAsync(Context.ConnectionId, Context.UserIdentifier);
        }

        if (Context.User is not null && Context.User.IsInRole(Constants.RoleAdmin))
        {
	        Groups.AddToGroupAsync(Context.ConnectionId, AdminUsers);
		}

        Groups.AddToGroupAsync(Context.ConnectionId, GroupAllUsers);

		return base.OnConnectedAsync();
    }
}