using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class PriceListExtensions
{
	public static PriceListModel ToModel(this PriceList entity)
	{
		return new PriceListModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Name = entity.Name,
			ServiceType = entity.ServiceType.ToString(),
			DurationType = entity.DurationType.ToString(),
			MaxCount = entity.MaxCount,
			Price = entity.Price,
			PriceExtra = entity.PriceExtra,
		};
	}

	public static IEnumerable<PriceListModel> ToModel(this IEnumerable<PriceList> list)
	{
		return list.Select(x => ToModel(x));
	}
}