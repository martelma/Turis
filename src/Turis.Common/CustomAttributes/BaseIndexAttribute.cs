namespace Turis.Common.CustomAttributes;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public class BaseIndexAttribute : Attribute, IIndexAttribute
{
    public string IndexTypeName { get; set; }
    public Type EntityType { get; set; }
    public string FieldName { get; set; }
    public Type FieldType { get; set; }
}

public interface IIndexAttribute
{
    string IndexTypeName { get; set; }
    Type EntityType { get; set; }
    string FieldName { get; set; }
    Type FieldType { get; set; }
}