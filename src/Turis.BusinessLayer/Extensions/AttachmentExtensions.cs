using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class AttachmentExtensions
{
	public static AttachmentModel ToModel(this Attachment item, IAuthService authService)
	{
		var model = new AttachmentModel
		{
			Id = item.Id,
			UserId = item.UserId,
			//User = (await authService.GetUserAsync(item.UserId)).Content,
			TimeStamp = item.TimeStamp,
			EntityName = item.EntityName,
			EntityKey = item.EntityKey,
			Folder = item.Folder,
			OriginalFileName = item.OriginalFileName,
			Type = item.Type,
			Note = item.Note
		};

		return model;
	}

	public static IEnumerable<AttachmentModel> ToModel(this IEnumerable<Attachment> items, IAuthService authService)
	{
		var list = new List<AttachmentModel>();

		foreach (var item in items)
		{
			var model = ToModel(item, authService);
			list.Add(model);
		}

		return list;
	}
}