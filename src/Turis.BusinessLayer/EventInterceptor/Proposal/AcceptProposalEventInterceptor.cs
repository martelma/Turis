using Turis.BusinessLayer.EventInterceptor.Base;
using Turis.BusinessLayer.Events;
using Turis.BusinessLayer.Services.Email;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Hubs;

namespace Turis.BusinessLayer.EventInterceptor.Proposal;

public class AcceptProposalEventInterceptor(
	IEventLogService eventLogService,
	IUserService userService,
	IHubContext<NotificationHub, INotificationHub> notificationHubContext,
	INotificationHubService notificationHubService,
	MailNotificationService mailNotificationService
)
	: BaseEventInterceptor(eventLogService, userService, notificationHubContext), INotificationHandler<AcceptProposalEvent>
{
	public async Task Handle(AcceptProposalEvent notification, CancellationToken cancellationToken)
	{
		await notificationHubService.ToAll().AcceptProposal(notification.ServiceId);
		//await mailNotificationService.SendMailAcceptProposal(service, collaborator);
	}
}