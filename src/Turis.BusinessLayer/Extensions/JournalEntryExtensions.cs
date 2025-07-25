﻿using System.Globalization;
using TinyHelpers.Extensions;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class JournalEntryExtensions
{
	public static Task<JournalEntryModel> ToModel(this JournalEntry entity,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		var bookmarkId = bookmarks?.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		var model = new JournalEntryModel
		{
			Id = entity.Id,
			UserId = entity.UserId,
			UserFullName = entity.User?.FullName,
			TimeStamp = entity.TimeStamp,
			Date = entity.Date,
			Amount = entity.Amount,
			Description = entity.Description,
			Note = entity.Note,
			Balance = entity.Balance,

			BookmarkId = bookmarkId.HasValue() ? bookmarkId.ToString() : string.Empty,
			AttachmentsCount = attachments?.Where(x => x.EntityKey == entity.Id).Count() ?? 0,
			Tags = tags?.Where(x => x.EntityKey == entity.Id).Select(x => x.Tag).ToModel()?.ToList()
		};

		return Task.FromResult(model);
	}

	public static async Task<List<JournalEntryModel>> ToModel(this IEnumerable<JournalEntry> list,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		var model = new List<JournalEntryModel>();
		if (list != null)
			foreach (var item in list)
				model.Add(await ToModel(item, bookmarks, attachments, tags));

		return model;
	}

	public static string ToMonthLabel(this int value)
	{
		if (value is < 1 or > 12)
			throw new ArgumentOutOfRangeException(nameof(value), "Il valore deve essere compreso tra 1 e 12.");

		// Usa DateTime per ottenere il nome del mese
		return new DateTime(1, value, 1).ToString("MMM");
	}

	public static string ToDayLabel(this DayOfWeek value, CultureInfo? culture = null)
	{
		culture ??= CultureInfo.CurrentCulture;

		// Ottiene il nome del giorno della settimana basato sulla cultura
		return culture.DateTimeFormat.GetDayName(value);
	}
}