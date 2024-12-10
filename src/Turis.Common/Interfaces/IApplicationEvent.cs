namespace Turis.Common.Interfaces;

public interface IApplicationEvent
{
    string UserName { get; }
    string EntityName { get; }
    string EntityId { get; }
    string EventName { get; }
    string AdditionalInfo { get; }
}