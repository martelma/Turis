using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class EntityTagExtensions
{
	public static EntityTagModel ToModel(this EntityTag item, IAuthService authService)
	{
		var model = new EntityTagModel
		{
			Id = item.Id,
			EntityName = item.EntityName,
			EntityKey = item.EntityKey,
			UserId = item.UserId,
			//User = (await authService.GetUserAsync(item.UserId)).Content,
			TimeStamp = item.TimeStamp,
			TagId= item.TagId,
			Tag = item.Tag.ToModel()
		};

		return model;
	}

	public static IEnumerable<EntityTagModel> ToModel(this IEnumerable<EntityTag> items, IAuthService authService)
	{
		var list = new List<EntityTagModel>();

		foreach (var item in items)
		{
			var model = ToModel(item, authService);
			list.Add(model);
		}

		return list;
	}
}