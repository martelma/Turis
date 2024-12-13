﻿using JeMa.Shared.Extensions;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class ServiceExtensions
{
	public static ServiceModel ToModel(this Service entity, IEnumerable<Bookmark> bookmarks)
	{
		var bookmarkId = bookmarks.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		return new ServiceModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Title = entity.Title,
			Date = entity.Date,
			DateText = entity.Date.ToString("dd/MM/yyyy"),
			ServiceType = entity.ServiceType.ToString(),
			DurationType = entity.DurationType.ToString(),
			Languages = entity.Languages?.SplitCsv()?.Select(x => x.ToLower()).ToArray(),
			Referent = entity.Referent,
			ReferentPhone = entity.ReferentPhone,
			Note = entity.Note,
			UserId = entity.UserId,
			CreationDate = entity.CreationDate,
			Status = entity.Status.ToString(),
			WorkflowCollaboratorStatus = entity.WorkflowCollaboratorStatus.ToString(),
			OptionExpiration = entity.OptionExpiration,
			OptionExpirationText = entity.OptionExpiration?.ToString("dd/MM/yyyy"),
			Location = entity.Location,
			MeetingPlace = entity.MeetingPlace,
			People = entity.People ?? 0,
			Checked = entity.Checked,
			PriceListId = entity.PriceList?.Id,
			PriceList = entity.PriceList?.ToModel(),
			PriceCalculated = entity.PriceCalculated ?? 0,
			Price = entity.Price ?? 0,
			ClientId = entity.Client?.Id,
			Client = entity.Client?.ToModel(),
			CollaboratorId = entity.Collaborator?.Id,
			Collaborator = entity.Collaborator?.ToModel(),
			CIGCode = entity.CIGCode,
			CUPCode = entity.CUPCode,
			CashedIn = entity.CashedIn ?? false,
			CashedDate = entity.CashedDate ?? DateTimeOffset.MinValue,

			CommissionPercentage = entity.CommissionPercentage,
			CommissionCalculated = entity.CommissionCalculated,
			Commission = entity.Commission > 0 ? entity.Commission : entity.CommissionCalculated,
			CommissionNote = entity.CommissionNote,
			CommissionPaid = entity.CommissionPaid,
			CommissionPaymentDate = entity.CashedDate ?? DateTimeOffset.MinValue,

			BookmarkId = bookmarkId.HasValue() ? bookmarkId.ToString() : string.Empty,
		};
	}

	public static IEnumerable<ServiceModel> ToModel(this IQueryable<Service> query, IEnumerable<Bookmark> bookmarks)
	{
		return query.AsEnumerable().ToModel(bookmarks);
	}

	public static IEnumerable<ServiceModel> ToModel(this IEnumerable<Service> list, IEnumerable<Bookmark> bookmarks)
	{
		return list.Select(x => x.ToModel(bookmarks));
	}
}