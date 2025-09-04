namespace Turis.BusinessLayer.Events;

public class RejectProposalEvent(Guid serviceId, Guid collaboratorId) : INotification
{
	public Guid ServiceId { get; } = serviceId;
	public Guid CollaboratorId { get; } = collaboratorId;
}