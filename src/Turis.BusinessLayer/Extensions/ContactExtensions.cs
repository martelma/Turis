﻿using Turis.Common.Models;
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
			Language = entity.Language?.ToModel(),
			FirstName = entity.FirstName,
			LastName = entity.LastName,
			FiscalCode = entity.FiscalCode,
			TaxCode = entity.TaxCode,
			CompanyName = entity.CompanyName,
			BirthDate = entity.BirthDate,
			BirthPlace = entity.BirthPlace,
			Address = entity.Address,
			City = entity.City,
			CAP = entity.CAP,
			RegionalCode = entity.RegionalCode,
			StateCode = entity.StateCode,
			Phone = entity.Phone,
			PhoneCell = entity.PhoneCell,
			Fax = entity.Fax,
			Web = entity.Web,
			EMail = entity.EMail,
			EMailAccounting = entity.EMailAccounting,
			Pec = entity.Pec,
			SdiCode = entity.SdiCode,
			IsClient = entity.IsClient,
			IsCollaborator = entity.IsCollaborator,
			Note = entity.Note,
			DocumentType = entity.DocumentType,
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