namespace Turis.BusinessLayer.DomainEvents.Base;

public class DeletedDomainEvent<T> : INotification
    where T : new()
{
    public T Entity { get; }

    public DeletedDomainEvent(T entity)
    {
        Entity = entity;
    }
}