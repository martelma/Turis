using JeMa.Shared.Extensions;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Mailing;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;
using Service = Turis.DataAccessLayer.Entities.Service;

namespace Turis.BusinessLayer.Extensions;

public static class ServiceExtensions
{
	public static async Task<ServiceEasyModel> ToModelEasyAsync(this Service entity, IAvatarContactService avatarContactService)
	{
		var model = new ServiceEasyModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Title = entity.Title,
			Date = entity.Date,
			DateText = entity.Date.ToString("dd/MM/yyyy"),
			TimeText = entity.Date.ToString("HH:mm"),
			ServiceType = entity.ServiceType.ToString(),
			DurationType = entity.DurationType.ToString(),
			Languages = entity.Languages?.SplitCsv()?.ToArray(),
			Referent = entity.Referent,
			ReferentPhone = entity.ReferentPhone,
			Note = entity.Note,
			UserId = entity.UserId,
			CreationDate = entity.CreationDate,
			Status = entity.Status.ToString(),
			OptionExpiration = entity.OptionExpiration,
			OptionExpirationText = entity.OptionExpiration?.ToString("dd/MM/yyyy"),
			Location = entity.Location,
			MeetingPlace = entity.MeetingPlace,
			People = entity.People,
			Checked = entity.Checked,
			PriceListId = entity.PriceList?.Id,
			PriceList = entity.PriceList?.ToModel(),
			PriceCalculated = entity.PriceCalculated,
			Price = entity.Price,
			ClientId = entity.Client?.Id,
			Client = entity.Client?.ToModel(),
			WorkflowCollaboratorStatus = entity.WorkflowCollaboratorStatus.ToString(),
			CollaboratorId = entity.Collaborator?.Id,
			Collaborator = entity.Collaborator?.ToModel(),
			CIGCode = entity.CIGCode,
			CUPCode = entity.CUPCode,
			CashedIn = entity.CashedIn,
			CashedDate = entity.CashedDate ?? DateTimeOffset.MinValue,

			CommissionPercentage = entity.CommissionPercentage,
			CommissionCalculated = entity.CommissionCalculated,
			Commission = entity.Commission > 0 ? entity.Commission : entity.CommissionCalculated,
			CommissionNote = entity.CommissionNote,
			CommissionPaid = entity.CommissionPaid,
			CommissionPaymentDate = entity.CashedDate ?? DateTimeOffset.MinValue,
		};

		if (model.Collaborator != null)
		{
			model.Collaborator.Avatar = (await avatarContactService.GetAsync(model.Collaborator.Id))?.Content != null
				? (await avatarContactService.GetAsync(model.Collaborator.Id))?.Content.Content.ConvertToBase64String()
				: null;
		}

		return model;
	}

	public static Task<IEnumerable<ServiceEasyModel>> ToModelEasyAsync(this IEnumerable<Service> list, IAvatarContactService avatarContactService)
	{
		return list.SelectAsync(x => x.ToModelEasyAsync(avatarContactService));
	}

	public static async Task<ServiceModel> ToModelAsync(this Service entity,
		IAvatarContactService avatarContactService,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		var bookmarkId = bookmarks?.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		var model = new ServiceModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Title = entity.Title,
			Date = entity.Date,
			DateText = entity.Date.ToString("dd/MM/yyyy"),
			TimeText = entity.Date.ToString("HH:mm"),
			ServiceType = entity.ServiceType.ToString(),
			DurationType = entity.DurationType.ToString(),
			Languages = entity.Languages?.SplitCsv()?.ToArray(),
			Referent = entity.Referent,
			ReferentPhone = entity.ReferentPhone,
			Note = entity.Note,
			UserId = entity.UserId,
			CreationDate = entity.CreationDate,
			Status = entity.Status.ToString(),
			OptionExpiration = entity.OptionExpiration,
			OptionExpirationText = entity.OptionExpiration?.ToString("dd/MM/yyyy"),
			Location = entity.Location,
			MeetingPlace = entity.MeetingPlace,
			People = entity.People,
			Checked = entity.Checked,
			PriceListId = entity.PriceList?.Id,
			PriceList = entity.PriceList?.ToModel(),
			PriceCalculated = entity.PriceCalculated,
			Price = entity.Price,
			ClientId = entity.Client?.Id,
			Client = entity.Client?.ToModel(),
			WorkflowCollaboratorStatus = entity.WorkflowCollaboratorStatus.ToString(),
			CollaboratorId = entity.Collaborator?.Id,
			Collaborator = entity.Collaborator?.ToModel(),
			CIGCode = entity.CIGCode,
			CUPCode = entity.CUPCode,
			CashedIn = entity.CashedIn,
			CashedDate = entity.CashedDate ?? DateTimeOffset.MinValue,

			CommissionPercentage = entity.CommissionPercentage,
			CommissionCalculated = entity.CommissionCalculated,
			Commission = entity.Commission > 0 ? entity.Commission : entity.CommissionCalculated,
			CommissionNote = entity.CommissionNote,
			CommissionPaid = entity.CommissionPaid,
			CommissionPaymentDate = entity.CashedDate ?? DateTimeOffset.MinValue,

			BookmarkId = bookmarkId.HasValue() ? bookmarkId.ToString() : string.Empty,
			AttachmentsCount = attachments?.Where(x => x.EntityKey == entity.Id).Count() ?? 0,
			Tags = tags?.Where(x => x.EntityKey == entity.Id).Select(x => x.Tag).ToModel()?.ToList()
		};

		if (model.Collaborator != null)
		{
			model.Collaborator.Avatar = (await avatarContactService.GetAsync(model.Collaborator.Id))?.Content != null
				? (await avatarContactService.GetAsync(model.Collaborator.Id))?.Content.Content.ConvertToBase64String()
				: null;
		}

		return model;
	}

	public static Task<IEnumerable<ServiceModel>> ToModel(this IEnumerable<Service> list,
		IAvatarContactService avatarContactService,
		List<Bookmark> bookmarks = null,
		List<Attachment> attachments = null,
		List<EntityTag> tags = null)
	{
		return list.SelectAsync(x => x.ToModelAsync(avatarContactService, bookmarks, attachments, tags));
	}

	public static Task<ServiceInfoModel> ToModelInfoAsync(this Service entity)
	{
		var model = new ServiceInfoModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Title = entity.Title,
			Date = entity.Date,
			DateText = entity.Date.ToString("dd/MM/yyyy"),
			TimeText = entity.Date.ToString("HH:mm"),
			ServiceType = entity.ServiceType.ToString(),
			DurationType = entity.DurationType.ToString(),
			Languages = entity.Languages?.SplitCsv()?.ToArray(),
			Referent = entity.Referent,
			ReferentPhone = entity.ReferentPhone,
			Note = entity.Note,
			UserId = entity.UserId,
			CreationDate = entity.CreationDate,
			Status = entity.Status.ToString(),
			OptionExpiration = entity.OptionExpiration,
			OptionExpirationText = entity.OptionExpiration?.ToString("dd/MM/yyyy"),
			Location = entity.Location,
			MeetingPlace = entity.MeetingPlace,
			People = entity.People,
			Checked = entity.Checked,
			PriceListId = entity.PriceList?.Id,
			PriceList = entity.PriceList?.ToModel(),
			PriceCalculated = entity.PriceCalculated,
			Price = entity.Price,
			ClientId = entity.Client?.Id,
			Client = entity.Client?.ToModel(),
			WorkflowCollaboratorStatus = entity.WorkflowCollaboratorStatus.ToString(),
			CollaboratorId = entity.Collaborator?.Id,
			Collaborator = entity.Collaborator?.ToModel(),
			CIGCode = entity.CIGCode,
			CUPCode = entity.CUPCode,
			CashedIn = entity.CashedIn,
			CashedDate = entity.CashedDate ?? DateTimeOffset.MinValue,

			CommissionPercentage = entity.CommissionPercentage,
			CommissionCalculated = entity.CommissionCalculated,
			Commission = entity.Commission > 0 ? entity.Commission : entity.CommissionCalculated,
			CommissionNote = entity.CommissionNote,
			CommissionPaid = entity.CommissionPaid,
			CommissionPaymentDate = entity.CashedDate ?? DateTimeOffset.MinValue,
		};

		return Task.FromResult(model);
	}

	public static Task<ProposalEmailModel> ToProposalEmailModelAsync(this Service service)
	{
		var model = new ProposalEmailModel
		{
			FirstName = service.Collaborator.FirstName,
			LastName = service.Collaborator.LastName,
			FullName = service.Collaborator.FullName,

			ServiceCode = service.Code,
			ServiceTitle = service.Title,
			ServiceDate = service.Date,
			ServiceClientCode = service.Client.Code,
			ServiceClientCompanyName = service.Client.CompanyName,
			Languages = service.Languages,
			People = service.People,
		};

		return Task.FromResult(model);
	}
}