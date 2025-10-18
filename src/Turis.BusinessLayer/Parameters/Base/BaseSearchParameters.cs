using System.ComponentModel;

namespace Turis.BusinessLayer.Parameters.Base;

public class BaseSearchParameters
{
	public int PageIndex { get; set; } = 0;
	public int PageSize { get; set; } = int.MaxValue;
	public string OrderBy { get; set; } = string.Empty;
}

public enum OrderByDirection
{
    [Description("Asc")]
    Asc = 1,
    [Description("Desc")]
    Desc = 2
}