using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class AliquotaIvaExtensions
{
	public static AliquotaIvaModel ToModel(this AliquotaIva entity)
	{
		return new AliquotaIvaModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Name = entity.Name,
			Description = entity.Description,
			Aliquota = entity.Aliquota,
			CodiceNatura = entity.CodiceNatura,
		};
}

public static IEnumerable<AliquotaIvaModel> ToModel(this IEnumerable<AliquotaIva> list)
	{
		return list.Select(x => ToModel(x));
	}
}