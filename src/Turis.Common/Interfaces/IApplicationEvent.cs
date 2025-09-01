namespace Turis.Common.Interfaces;

public interface IApplicationEvent
{
    string UserName { get; }
    string EntityName { get; }
    string EntityKey { get; }
    string EventName { get; }
    string AdditionalInfo { get; }
}