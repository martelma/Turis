using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class PaymentItemExtensions
{
	public static async Task<PaymentItemModel> ToModel(this PaymentItem entity)
	{
		var model = new PaymentItemModel
		{
			Id = entity.Id,
			PaymentId = entity.PaymentId,
			Payment = await entity.Payment.ToModel(),
			ServiceId = entity.ServiceId,
			Service = await entity.Service.ToModelInfoAsync(),
		};

		if (entity.Payment != null)
			model.Payment = await entity.Payment.ToModel();

		if (entity.Service != null)
			model.Service = await entity.Service.ToModelInfoAsync();

		return model;
	}

	public static async Task<List<PaymentItemModel>> ToModel(this IEnumerable<PaymentItem> list)
	{
		var model = new List<PaymentItemModel>();
		foreach (var item in list)
			model.Add(await ToModel(item));

		return model;
	}
}