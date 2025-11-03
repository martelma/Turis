using Turis.Authentication.Entities;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Extensions;

public static class ApplicationUserExtensions
{
	public static UserModel ToModel(this ApplicationUser item)
	{
		var model = new UserModel
		{
			Id = item.Id,
			UserName = item.UserName,
			FirstName = item.FirstName,
			LastName = item.LastName,
			Email = item.Email,
			Language = item.Language,
			ContactId = item.ContactId,
		};

		return model;
	}

	public static IEnumerable<UserModel> ToModel(this IEnumerable<ApplicationUser> items)
	{
		return items.Select(ToModel);
	}

	public static CollaboratorModel ToCollaboratorModel(this ApplicationUser item)
	{
		var model = new CollaboratorModel
		{
			Id = item.Id,
			UserName = item.UserName,
			FirstName = item.FirstName,
			LastName = item.LastName,
			Email = item.Email,
			PhoneNumber = item.PhoneNumber,
			Language = item.Language,
			ContactId = item.ContactId,
		};

		return model;
	}

	public static IEnumerable<CollaboratorModel> ToCollaboratorModel(this IEnumerable<ApplicationUser> items)
	{
		return items.Select(ToCollaboratorModel);
	}
}