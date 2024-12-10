using Turis.Common.CustomAttributes;

namespace Turis.Common.Config;

public class DataModel
{
    private static readonly Dictionary<string, string> _setKey = new();
    private static readonly Dictionary<string, string> _indexPrimaryKey = new();
    private readonly Dictionary<Type, List<IIndexAttribute>> _indexes = new();

    public void Add(Type type)
    {
        if (!_indexes.ContainsKey(type))
            _indexes.Add(type, type.GetIndexAttributes());

        if (!_setKey.ContainsKey(type.Name))
            _setKey.Add(type.Name, $"{Constants.PrefixEntityKey}:{type.Name}");

        //if (!_setKeyAll.ContainsKey(type.Name))
        //	_setKeyAll.Add(type.Name, $"{Constants.PrefixEntityKey}-All-{type.Name}");

        //if (!_indexPrimaryKey.ContainsKey(type.Name))
        //	_indexPrimaryKey.Add(type.Name, $"{Constants.PrefixIndexPrimaryKey}:{type.Name}");
    }

    public List<IIndexAttribute> this[Type type]
        => _indexes[type];

    public static IEnumerable<T> GetIndexes<T>(Type type)
    {
        var indexes = Config.DataModel[type];
        if (indexes.Count == 0)
            return null;

        var list = indexes.Where(x => x.IndexTypeName == typeof(T).Name);
        return list.Cast<T>();
    }

    public IEnumerable<T> Indexes<T>(Type type)
    {
        var indexes = Config.DataModel[type];
        if (indexes.Count == 0)
            return null;

        var list = indexes.Where(x => x.IndexTypeName == typeof(T).Name);
        return list.Cast<T>();
    }

    public string GetEntityKeyAll => Constants.PrefixEntityKey;
    public string GetSetKeys<T>()
    {
        return GetSetKeys(typeof(T).Name);
    }

    public string GetSetKeys(string typeName)
    {
        return _setKey[typeName];
    }

    public string GetIndexPrimaryKey<T>()
    {
        return GetIndexPrimaryKey(typeof(T).Name);
    }

    public static string GetIndexPrimaryKey(string typeName)
    {
        return _indexPrimaryKey[typeName];
    }

    public IndexAttribute? GetIndexOn<T>(string fieldName)
    {
        var indexAttributes = GetIndexes<IndexAttribute>(typeof(T));
        return indexAttributes.FirstOrDefault(x => x.FieldName == fieldName);
    }

    public SortedIndexAttribute? GetSortedIndexOn<T>(string fieldName)
    {
        var indexAttributes = GetIndexes<SortedIndexAttribute>(typeof(T));
        return indexAttributes.FirstOrDefault(x => x.FieldName == fieldName);
    }
}