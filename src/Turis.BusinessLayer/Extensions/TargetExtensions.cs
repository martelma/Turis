using JeMa.Shared.Extensions;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class TargetExtensions
{
	public static async Task<TargetModel> ToModelAsync(this Target entity, IAvatarContactService avatarContactService)
	{
		var model = new TargetModel
		{
			Id = entity.Id,
			CollaboratorId = entity.CollaboratorId,
			Collaborator = entity.Collaborator?.ToModel(),
			Year = entity.Year,
			Month = entity.Month,
			AmountMin = entity.AmountMin,
			AmountMax = entity.AmountMax,
			PercentageMin = entity.PercentageMin,
			PercentageMax = entity.PercentageMax,
		};

		if (model.Collaborator != null)
		{
			model.Collaborator.Avatar = (await avatarContactService.GetAsync(model.Collaborator.Id))?.Content != null
				? (await avatarContactService.GetAsync(model.Collaborator.Id))?.Content.Content.ConvertToBase64String()
				: null;
		}

		return model;
	}

	public static Task<IEnumerable<TargetModel>> ToModelAsync(this IEnumerable<Target> list, IAvatarContactService avatarContactService)
	{
		return list.SelectAsync(x => ToModelAsync(x, avatarContactService));
	}
}