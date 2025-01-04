using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class DocumentItemExtensions
{
	public static async Task<DocumentItemModel> ToModel(this DocumentItem entity)
	{
		return new DocumentItemModel
		{
			Id = entity.Id,
			DocumentId = entity.DocumentId,
			Document = entity.Document.ToModel(),
			ServiceId = entity.ServiceId,
			Service = await entity.Service.ToModelInfoAsync(),
			Code = entity.Code,
			Description = entity.Description,
			CodiceNatura = entity.CodiceNatura,
			RiferimentoNormativo = entity.RiferimentoNormativo,
			Quantity = entity.Quantity,
			Price = entity.Price,
			DiscountPercentage = entity.DiscountPercentage,
			VatRate = entity.VatRate,
			CodiceEsigibilitaIVA = entity.CodiceEsigibilitaIVA,
		};
	}

	public static IEnumerable<DocumentModel> ToModel(this IEnumerable<Document> list)
	{
		return list.Select(x => x.ToModel());
	}
}