using JeMa.Shared.Extensions;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class JournalEntryExtensions
{
	public static async Task<JournalEntryModel> ToModel(this JournalEntry entity, IEnumerable<Bookmark> bookmarks)
	{
		var bookmarkId = bookmarks.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		var model = new JournalEntryModel
		{
			Id = entity.Id,
			UserId = entity.UserId,
			TimeStamp = entity.TimeStamp,
			Date = entity.Date,
			Amount = entity.Amount,
			Description = entity.Description,

			BookmarkId = bookmarkId.HasValue() ? bookmarkId.ToString() : string.Empty,
		};

		return model;
	}

	public static async Task<List<JournalEntryModel>> ToModel(this IEnumerable<JournalEntry> list, IEnumerable<Bookmark> bookmarks)
	{
		var model = new List<JournalEntryModel>();
		if (list != null)
			foreach (var item in list)
				model.Add(await ToModel(item, bookmarks));

		return model;
	}
}