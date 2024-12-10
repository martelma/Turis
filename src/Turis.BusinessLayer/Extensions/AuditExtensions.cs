using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class AuditExtensions
{
	public static AuditModel ToModel(this Audit item)
	{
		var model = new AuditModel
		{
			Id = item.Id,
			UserId = item.UserId,
			Action = item.Action,
			Date = item.Date,
			EntityName = item.EntityName,
			EntityKey = item.EntityKey,
			Values = item.Values,
		};
		return model;
	}

	public static IEnumerable<AuditModel> ToModel(this IEnumerable<Audit> items)
	{
		return items.Select(x => ToModel(x));
	}
}