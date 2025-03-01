using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class TagExtensions
{
	public static TagModel ToModel(this Tag entity)
	{
		return new TagModel
		{
			Id = entity.Id,
			Name = entity.Name,
			Description = entity.Description,
			Color = entity.Color,
		};
	}

	public static IEnumerable<TagModel> ToModel(this IEnumerable<Tag> list)
	{
		return list.Select(ToModel);
	}
}