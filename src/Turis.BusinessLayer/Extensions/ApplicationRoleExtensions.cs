using Turis.Authentication.Entities;
using Turis.Common.Enums;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Extensions;

public static class ApplicationRoleExtensions
{
	public static ApplicationRoleModel ToModel(this ApplicationRole entity)
	{
		return new ApplicationRoleModel
		{
			Id = entity.Id,
			Name = entity.Name,
			Description = entity.Description,
			Scopes = entity.Scopes?.Select(s => new ApplicationScopeModel
			{
				Id = s.Scope.Id,
				Name = s.Scope.Name,
				RoleIds = entity.Scopes?.Select(rs => rs.RoleId).ToList(),
				ScopeGroupId = s.Scope.ScopeGroupId,
				ApplicationId = s.Scope.ApplicationId
			}).ToList(),
			Users = entity.UserRoles?.Select(ur => new UserModel
				{
					Id = ur.User.Id,
					UserName = ur.User.UserName,
					FirstName = ur.User.FirstName,
					LastName = ur.User.LastName,
					Email = ur.User.Email,
					Language = ur.User.Language,
					IsActive = ur.User.LockoutEnd.GetValueOrDefault(DateTimeOffset.MinValue) < DateTime.UtcNow,
					AccountType = ur.User.PasswordHash != null ? AccountType.Local : AccountType.AzureActiveDirectory
				})
				.GroupBy(u => u.Id)
				.Select(u => u.First())
		};
	}

	public static IEnumerable<ApplicationRoleModel> ToModel(this IQueryable<ApplicationRole> query)
	{
		return ToModel(query.AsEnumerable());
	}

	public static IEnumerable<ApplicationRoleModel> ToModel(this IEnumerable<ApplicationRole> list)
	{
		return list.Select(ToModel);
	}
}

