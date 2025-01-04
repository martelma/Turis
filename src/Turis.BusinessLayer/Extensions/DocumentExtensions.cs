using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class DocumentExtensions
{
	public static DocumentModel ToModel(this Document entity)
	{
		return new DocumentModel
		{
			Id = entity.Id,
			DocumentRefId = entity.DocumentRefId,
			DocumentRef = entity.DocumentRef.ToModel(),
			Type = entity.Type.ToString(),
			Status = entity.Status.ToString(),
			ClientId = entity.ClientId,
			Client = entity.Client.ToModel(),
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
			Collaborator = entity.Collaborator.ToModel(),
			SdiCodiceTipoPagamento = entity.SdiCodiceTipoPagamento,
			SdiValoreTipoPagamento = entity.SdiValoreTipoPagamento,
			SdiCodiceCondizionePagamento = entity.SdiCodiceCondizionePagamento,
			DataScadenzaPagamento = entity.DataScadenzaPagamento,
			Cig = entity.Cig,
			Cup = entity.Cup,
		};
	}

	public static IEnumerable<DocumentModel> ToModel(this IEnumerable<Document> list)
	{
		return list.Select(x => ToModel(x));
	}
}