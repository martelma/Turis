namespace Turis.BusinessLayer.Parameters.Base;

public class Paginator(BaseSearchParameters parameters)
{
	public int PageIndex { get; set; } = parameters.PageIndex;
	public int PageSize { get; set; } = parameters.PageSize;
    public string OrderBy { get; set; }
}