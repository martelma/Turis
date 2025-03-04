using Newtonsoft.Json;
using StackExchange.Redis;

namespace Turis.Common.Extensions;

/// <summary>
/// MyType obj1 = aStream.CreateFromJsonStream<MyType>();
/// MyType obj2 = "{\"key\":\"value\"}".CreateFromJsonString<MyType>();
/// MyType obj3 = "data.json".CreateFromJsonFile<MyType>();
/// </summary>
public static class JsonExtensions
{
	public static T CreateFromJsonStream<T>(this Stream stream)
	{
		var serializer = new JsonSerializer();
		T data;
		using (var streamReader = new StreamReader(stream))
		{
			data = (T)serializer.Deserialize(streamReader, typeof(T));
		}
		return data;
	}

	public static T CreateFromJsonString<T>(this string json)
	{
		if (TinyHelpers.Extensions.CollectionExtensions.IsNullOrEmpty(json))
			return default(T);

		T data;
		using (var stream = new MemoryStream(System.Text.Encoding.Default.GetBytes(json)))
		{
			data = CreateFromJsonStream<T>(stream);
		}
		return data;
	}

	public static T CreateFromJsonFile<T>(this string fileName)
	{
		T data;
		using (var fileStream = new FileStream(fileName, FileMode.Open))
		{
			data = CreateFromJsonStream<T>(fileStream);
		}
		return data;
	}

	public static T FromJsonOrDefault<T>(this RedisValue actual) where T : new()
	{
		return !actual.HasValue
			? new T()
			: FromJsonOrDefault<T>(actual.ToString());
	}

	public static T FromJsonOrDefault<T>(this string json) where T : new()
	{
		return string.IsNullOrEmpty(json)
			? new T()
			: JsonConvert.DeserializeObject<T>(json);
	}

	public static string ToJson<T>(this T obj) where T : new()
	{
		if(obj is null)
			return "[]";

		return JsonConvert.SerializeObject(obj);
	}
}