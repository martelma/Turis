using Turis.Authentication.Entities;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Extensions;

public static class ApplicationScopeGroupExtensions
{
	public static ApplicationScopeGroupModel ToModel(this ApplicationScopeGroup entity)
	{
		return new ApplicationScopeGroupModel
		{
			Id = entity.Id,
			Name = entity.Name,
			Description = entity.Description,
		};
	}
	public static IEnumerable<ApplicationScopeGroupModel> ToModel(this IQueryable<ApplicationScopeGroup> query)
	{
		return ToModel(query.AsEnumerable());
	}

	public static IEnumerable<ApplicationScopeGroupModel> ToModel(this IEnumerable<ApplicationScopeGroup> list)
	{
		return list.Select(ToModel);
	}
}