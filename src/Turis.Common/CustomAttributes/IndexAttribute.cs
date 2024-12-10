namespace Turis.Common.CustomAttributes;

public class IndexAttribute : BaseIndexAttribute
{
    public IndexAttribute()
    {
    }

    public string IndexName => $"{Constants.PrefixIndexKey}:{EntityType.Name}-{FieldName}";
}