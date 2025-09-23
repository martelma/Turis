using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class PaymentTypeExtensions
{
	public static PaymentTypeModel ToModel(this PaymentType entity)
	{
		return new PaymentTypeModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Name = entity.Name,
			Note = entity.Note,
			SdiCode = entity.SdiCode,
			SdiName = entity.SdiName
		};
	}

	public static IEnumerable<PaymentTypeModel> ToModel(this IEnumerable<PaymentType> list)
	{
		return list.Select(ToModel);
	}
}