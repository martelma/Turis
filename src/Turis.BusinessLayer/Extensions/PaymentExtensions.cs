using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class PaymentExtensions
{
	public static async Task<PaymentModel> ToModel(this Payment entity, IEnumerable<Bookmark> bookmarks = null)
	{
		var bookmarkId = bookmarks?.FirstOrDefault(x => x.EntityId == entity.Id)?.Id;

		var model = new PaymentModel();
		model.Id = entity.Id;
		model.Date = entity.Date;

		model.CollaboratorId = entity.CollaboratorId;
		model.Collaborator = entity.Collaborator?.ToModel();

		model.VatRate = entity.VatRate;
		model.Vat = entity.Vat;

		model.WithholdingTaxRate = entity.WithholdingTaxRate;
		model.WithholdingTax = entity.WithholdingTax;

		model.Amount = entity.Amount;
		model.Total = entity.Total;

		model.Items = await entity.Items.ToModel();

		return model;
	}

	public static async Task<List<PaymentModel>> ToModel(this IEnumerable<Payment> list, IEnumerable<Bookmark> bookmarks)
	{
		var model = new List<PaymentModel>();
		if (list != null)
			foreach (var item in list)
				model.Add(await ToModel(item, bookmarks));

		return model;
	}
}