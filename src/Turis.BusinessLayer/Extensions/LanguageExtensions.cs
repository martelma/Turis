using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Extensions;

public static class LanguageExtensions
{
	public static LanguageModel ToModel(this Language entity)
	{
		return new LanguageModel
		{
			Id = entity.Id,
			Code = entity.Code,
			Name = entity.Name,
			CodeIso = entity.CodeIso,
		};
	}

    public static IEnumerable<LanguageModel> ToModel(this IEnumerable<Language> list)
    {
        return list.Select(x => x.ToModel());
    }
}