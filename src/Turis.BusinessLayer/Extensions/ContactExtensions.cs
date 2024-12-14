using JeMa.Shared.Extensions;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class ContactExtensions
{
	public static ContactModel ToModel(this Contact entity)
	{
		return new ContactModel
		{
			Id = entity.Id,
			Code = entity.Code,
			ExternalCode = entity.ExternalCode,
			Title = entity.Title,
			Sex = entity.Sex,
			Languages = entity.Languages?.SplitCsv()?.Select(x => x.ToLower()).ToArray(),
			//Language = entity.Language?.ToModel(),
			FirstName = entity.FirstName,
			LastName = entity.LastName,
			FiscalCode = entity.FiscalCode,
			TaxCode = entity.TaxCode,
			CompanyName = entity.CompanyName,
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
		};
	}

	public static IEnumerable<ContactModel> ToModel(this IQueryable<Contact> query)
	{
		return ToModel(query.AsEnumerable());
	}

	public static IEnumerable<ContactModel> ToModel(this IEnumerable<Contact> list)
	{
		return list.Select(ToModel);
	}
}