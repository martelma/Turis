namespace Turis.Common.CustomAttributes;

public class SortedIndexAttribute : BaseIndexAttribute
{
    public SortedIndexAttribute()
    {
    }

    public string IndexName => $"{Constants.PrefixIndexSortedKey}:{EntityType.Name}-{FieldName}";
}