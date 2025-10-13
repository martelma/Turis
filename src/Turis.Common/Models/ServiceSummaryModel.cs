using Turis.Common.Enums;
using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class ServiceSummaryModel : BaseModel
{
	public int Proposals { get; set; }
	public int WeekProposals { get; set; }
	public int Checked { get; set; }
	public int CheckedToAssign { get; set; }
	public int ToDo { get; set; }
	public int WeekToDo { get; set; }
	public int Done { get; set; }
	public int WeekDone { get; set; }

	public int ToBeCommunicated { get; set; }
	public int Pending { get; set; }
	public int Confirmed { get; set; }

	public List<AnnualStat> AnnualStats { get; set; } = [];
	public List<LanguageStat> LanguageStats { get; set; } = [];
	public List<TypeStat> TypeStats { get; set; } = [];
	public List<TagStat> TagStats { get; set; } = [];
}

public class AnnualStat
{
	public int Year { get; set; }
	public decimal Total { get; set; }
}

public class LanguageStat
{
	public string LanguageCode { get; set; }
	public int Count { get; set; }
}

public class TypeStat
{
	public string ServiceType { get; set; }
	public string DurationType { get; set; }
	public int Count { get; set; }
}

public class TagStat
{
	public string TagName { get; set; }
	public int Count { get; set; }
}