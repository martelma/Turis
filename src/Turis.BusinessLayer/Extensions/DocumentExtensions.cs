using TinyHelpers.Extensions;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class DocumentExtensions
{
	public static async Task<DocumentModel> ToModel(this Document entity, IEnumerable<Bookmark> bookmarks)
	{
		var bookmarkId = bookmarks?.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		var model = new DocumentModel();
		model.Id = entity.Id;
		model.DocumentRefId = entity.DocumentRefId;
		model.Type = entity.Type.ToString();
		model.Status = entity.Status.ToString();
		model.ClientId = entity.ClientId;
		model.Client = entity.Client?.ToModel();
		model.IdSdi = entity.IdSdi;
		model.Date = entity.Date;
		model.Sectional = entity.Sectional;
		model.Number = entity.Number;
		model.DiscountPercentage = entity.DiscountPercentage;
		model.Discount = entity.Discount;
		model.Amount = entity.Amount;
		model.VatRate = entity.VatRate;
		model.Vat = entity.Vat;
		model.AliquotaRitenutaDiAcconto = entity.AliquotaRitenutaDiAcconto;
		model.RitenutaDiAcconto = entity.RitenutaDiAcconto;
		model.TotalExemptExpenses = entity.TotalExemptExpenses;
		model.TotalExpenses = entity.TotalExpenses;
		model.Total = entity.Total;
		model.ImportoBollo = entity.ImportoBollo;
		model.DesTipoPagamento = entity.DesTipoPagamento;
		model.Saldato = entity.Saldato;
		model.DataIncasso = entity.DataIncasso;
		model.CollaboratorId = entity.CollaboratorId;
		model.Collaborator = entity.Collaborator?.ToModel();
		model.SdiCodiceTipoPagamento = entity.SdiCodiceTipoPagamento;
		model.SdiValoreTipoPagamento = entity.SdiValoreTipoPagamento;
		model.SdiCodiceCondizionePagamento = entity.SdiCodiceCondizionePagamento;
		model.DataScadenzaPagamento = entity.DataScadenzaPagamento;
		model.IdDocumento = entity.IdDocumento;
		model.Cig = entity.Cig;
		model.Cup = entity.Cup;
		model.BookmarkId = bookmarkId.HasValue() ? bookmarkId.ToString() : string.Empty;
		model.Items = await entity.Items.ToModel();

		if (entity.DocumentRef != null)
			model.DocumentRef = await entity.DocumentRef.ToModel(bookmarks);

		return model;
	}

	public static async Task<List<DocumentModel>> ToModel(this IEnumerable<Document> list, IEnumerable<Bookmark> bookmarks)
	{
		var model = new List<DocumentModel>();
		if (list != null)
			foreach (var item in list)
				model.Add(await item.ToModel(bookmarks));

		return model;
	}

	public static DocumentInfoModel ToModelInfo(this Document entity)
	{
		var model = new DocumentInfoModel
		{
			Id = entity.Id,
			DocumentRefId = entity.DocumentRefId,
			Type = entity.Type.ToString(),
			Status = entity.Status.ToString(),
			ClientId = entity.ClientId,
			Client = entity.Client?.ToModel(),
			IdSdi = entity.IdSdi,
			Date = entity.Date,
			Sectional = entity.Sectional,
			Number = entity.Number,
			DiscountPercentage = entity.DiscountPercentage,
			Discount = entity.Discount,
			Amount = entity.Amount,
			VatRate = entity.VatRate,
			Vat = entity.Vat,
			AliquotaRitenutaDiAcconto = entity.AliquotaRitenutaDiAcconto,
			RitenutaDiAcconto = entity.RitenutaDiAcconto,
			TotalExemptExpenses = entity.TotalExemptExpenses,
			TotalExpenses = entity.TotalExpenses,
			Total = entity.Total,
			ImportoBollo = entity.ImportoBollo,
			DesTipoPagamento = entity.DesTipoPagamento,
			Saldato = entity.Saldato,
			DataIncasso = entity.DataIncasso,
			CollaboratorId = entity.CollaboratorId,
			Collaborator = entity.Collaborator?.ToModel(),
			SdiCodiceTipoPagamento = entity.SdiCodiceTipoPagamento,
			SdiValoreTipoPagamento = entity.SdiValoreTipoPagamento,
			SdiCodiceCondizionePagamento = entity.SdiCodiceCondizionePagamento,
			DataScadenzaPagamento = entity.DataScadenzaPagamento,
			IdDocumento = entity.IdDocumento,
			Cig = entity.Cig,
			Cup = entity.Cup,
			DocumentRef = entity.DocumentRef?.ToModelInfo()
		};

		return model;
	}

	public static List<DocumentInfoModel> ToModelInfo(this IEnumerable<Document> list)
	{
		return list.Select(x => x.ToModelInfo()).ToList();
	}
}