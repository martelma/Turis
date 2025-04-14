using Turis.Authentication.Entities;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Extensions;

public static class ApplicationScopeExtensions
{
	public static ApplicationScopeModel ToModel(this ApplicationScope entity)
	{
		return new ApplicationScopeModel
		{
			Id = entity.Id,
			Name = entity.Name,
			Description = entity.Description,
			RoleIds = entity.Roles?.Select(r => r.RoleId).ToList(),
			ApplicationId = entity.ApplicationId,
			ScopeGroupId = entity.ScopeGroupId,
			ScopeGroupName = entity.ScopeGroup?.Name
		};
	}

	public static IEnumerable<ApplicationScopeModel> ToModel(this IQueryable<ApplicationScope> query)
	{
		return ToModel(query.AsEnumerable());
	}

	public static IEnumerable<ApplicationScopeModel> ToModel(this IEnumerable<ApplicationScope> list)
	{
		return list.Select(ToModel);
	}
}