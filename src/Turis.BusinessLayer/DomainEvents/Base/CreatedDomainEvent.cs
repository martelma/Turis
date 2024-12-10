namespace Turis.BusinessLayer.DomainEvents.Base;

public class CreatedDomainEvent<T> : INotification
    where T : new()
{
    public readonly string UserName;
    public T Entity { get; }

    public CreatedDomainEvent(T entity)
    {
        Entity = entity;
    }

    public CreatedDomainEvent(string userName, T entity) : this(entity)
    {
        UserName = userName;
    }
}