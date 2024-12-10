namespace Turis.BusinessLayer.Parameters.Base;

public class Paginator(BaseSearchParameters parameters)
{
	public int PageIndex { get; set; } = parameters.PageIndex.GetValueOrDefault(0);
	public int PageSize { get; set; } = parameters.PageSize.GetValueOrDefault(int.MaxValue);
    public string OrderBy { get; set; }
}