using System.Xml.Serialization;

namespace Turis.Common.Extensions;

public static class ObjectExtensions
{
	public static string ToXmlString<T>(this T toSerialize)
	{
		var xmlSerializer = new XmlSerializer(toSerialize.GetType());

		using (var textWriter = new StringWriter())
		{
			xmlSerializer.Serialize(textWriter, toSerialize);
			return textWriter.ToString();
		}
	}
}