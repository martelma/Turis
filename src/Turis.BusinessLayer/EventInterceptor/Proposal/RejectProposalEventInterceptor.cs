using Turis.BusinessLayer.EventInterceptor.Base;
using Turis.BusinessLayer.Events;
using Turis.BusinessLayer.Services.Email;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Hubs;

namespace Turis.BusinessLayer.EventInterceptor.Proposal;

public class RejectProposalEventInterceptor(
	IEventLogService eventLogService,
	IUserService userService,
	IHubContext<NotificationHub, INotificationHub> notificationHubContext,
	INotificationHubService notificationHubService,
	MailNotificationService mailNotificationService
	)
	: BaseEventInterceptor(eventLogService, userService, notificationHubContext), INotificationHandler<RejectProposalEvent>
{
	public async Task Handle(RejectProposalEvent notification, CancellationToken cancellationToken)
	{
		await notificationHubService.ToAll().RejectProposal(notification.ServiceId);
		//await mailNotificationService.SendMailRejectProposal(service, collaborator);
	}
}