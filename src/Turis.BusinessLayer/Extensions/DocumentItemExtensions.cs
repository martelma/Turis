using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class DocumentItemExtensions
{
	public static async Task<DocumentItemModel> ToModel(this DocumentItem entity)
	{
		var model = new DocumentItemModel
		{
			Id = entity.Id,
			DocumentId = entity.DocumentId,
			ServiceId = entity.ServiceId,
			Code = entity.Code,
			Description = entity.Description,
			CodiceNatura = entity.CodiceNatura,
			RiferimentoNormativo = entity.RiferimentoNormativo,
			Quantity = entity.Quantity,
			Price = entity.Price,
			DiscountPercentage = entity.DiscountPercentage,
			VatRate = entity.VatRate,
			CodiceEsigibilitaIVA = entity.CodiceEsigibilitaIVA,
			Document = entity.Document?.ToModelInfo(),
			Service = await entity.Service?.ToModelInfoAsync()
		};

		return model;
	}

	public static async Task<List<DocumentItemModel>> ToModel(this IEnumerable<DocumentItem> list)
	{
		var model = new List<DocumentItemModel>();
		foreach (var item in list)
			model.Add(await item.ToModel());

		return model;
	}
}