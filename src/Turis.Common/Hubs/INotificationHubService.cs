namespace Turis.Common.Hubs;

public interface INotificationHubService
{
    INotificationHub ToAll();
    INotificationHub ToGroup(string groupName);

	Task ToAllAsync(ProgressInfo progressInfo);
    Task ToAllAsync(TaskCompletedMessage taskCompletedMessage);
    Task ToAdminsAsync(ProgressInfo progressInfo);
    Task ToUserAsync(ProgressInfo progressInfo);
    Task ToUserAndAdminsAsync(ProgressInfo progressInfo);
    Task ToUserAndAdminsAsync(TaskCompletedMessage taskCompletedMessage);
    Task ToUserAndAdminsAsync(Message message);
    Task ToGroupAsync(string groupName, ProgressInfo progressInfo);
    //Task AcceptProposal(Guid serviceId);
    //Task RejectProposal(Guid serviceId);
}