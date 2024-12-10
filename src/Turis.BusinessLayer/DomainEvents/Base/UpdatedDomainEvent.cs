namespace Turis.BusinessLayer.DomainEvents.Base;

/*
 * https://github.com/jbogard/MediatR/wiki
 * IRequest - dispatched to a single handler (in this case use _mediator.Send)
 * INotification - dispatched to multiple handlers (in this case use _mediator.Publish)
 */
public class UpdatedDomainEvent<T> : INotification
    where T : new()
{
    public T OldEntity { get; }
    public T NewEntity { get; }

    public UpdatedDomainEvent(T oldEntity, T newEntity)
    {
        OldEntity = oldEntity;
        NewEntity = newEntity;
    }
}