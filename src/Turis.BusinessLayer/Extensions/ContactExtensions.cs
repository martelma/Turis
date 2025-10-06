using JeMa.Shared.Extensions;
using TinyHelpers.Extensions;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class ContactExtensions
{
	public static ContactModel ToModel(this Contact entity,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		var bookmarkId = bookmarks?.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		return new ContactModel
		{
			Id = entity.Id,
			Code = entity.Code,
			ExternalCode = entity.ExternalCode,
			Title = entity.Title,
			Sex = entity.Sex,
			Languages = entity.Languages?.SplitCsv()?.ToArray(),
			FirstName = entity.FirstName,
			LastName = entity.LastName,
			FiscalCode = entity.FiscalCode,
			TaxCode = entity.TaxCode,
			CompanyName = entity.CompanyName,
			DisplayName = entity.DisplayName,
			BirthDate = entity.BirthDate,
			BirthDateText = entity.BirthDate.HasValue ? entity.BirthDate.Value.ToString("dd/MM/yyyy") : string.Empty,
			BirthPlace = entity.BirthPlace,
			Address = entity.Address,
			City = entity.City,
			Cap = entity.Cap,
			RegionalCode = entity.RegionalCode,
			StateCode = entity.StateCode,
			Phone1 = entity.Phone1,
			Phone2 = entity.Phone2,
			Fax = entity.Fax,
			Web = entity.Web,
			EMail = entity.EMail,
			EMailAccounting = entity.EMailAccounting,
			Pec = entity.Pec,
			SdiCode = entity.SdiCode,
			Note = entity.Note,
			DocumentType = entity.DocumentType.ToString(),
			ContactType = entity.ContactType.ToString(),
			PercentageGuida = entity.PercentageGuida,
			PercentageAccompagnamento = entity.PercentageAccompagnamento,
			BookmarkId = bookmarkId.HasValue() ? bookmarkId.ToString() : string.Empty,
			AttachmentsCount = attachments?.Where(x => x.EntityKey == entity.Id).Count() ?? 0,
			Tags = tags?.Where(x => x.EntityKey == entity.Id).Select(x => x.Tag).ToModel()?.ToList(),
			MonitorStat = entity.MonitorStat
		};
	}

	public static IEnumerable<ContactModel> ToModel(this IQueryable<Contact> query,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		return ToModel(query.AsEnumerable(), bookmarks, attachments, tags);
	}

	public static IEnumerable<ContactModel> ToModel(this IEnumerable<Contact> list,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		return list.Select(x => x.ToModel(bookmarks, attachments, tags));
	}

	//public static TeamMemberModel ToTeamMemberModel(this Contact entity,
	//	List<Bookmark> bookmarks = null,
	//	List<Attachment> attachments = null,
	//	List<EntityTag> tags = null)
	//{
	//	var bookmarkId = bookmarks?.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

	//	return new TeamMemberModel
	//	{
	//		Id = entity.Id,
	//		Collaborator = entity.ToModel()
	//	};
	//}

	//public static IEnumerable<TeamMemberModel> ToTeamMemberModel(this IEnumerable<Contact> list,
	//	List<Bookmark> bookmarks = null,
	//	List<Attachment> attachments = null,
	//	List<EntityTag> tags = null)
	//{
	//	return list.Select(x => x.ToTeamMemberModel(bookmarks, attachments, tags));
	//}
}